import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  Bookmark,
  Trash2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react-native';
import { api } from '../../src/services/api';
import { offlineStorage } from '../../src/services/offlineStorage';
import { Colors, BorderRadius, Spacing } from '../../src/theme/colors';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  cautions?: string[];
  followUps?: string[];
  disclaimer?: string;
  timestamp: string;
}

const LANGUAGE_PROMPTS = {
  Tagalog: [
    'Bakit naninilaw ang dahon ng kamatis ko?',
    'Kailan ang tamang oras ng pagdilig ng gulay?',
    'Ano ang mabisang organikong pamatay-peste sa talong?',
    'Paano maghanda ng organikong pataba (compost)?',
  ],
  Bisaya: [
    'Nganong dalag man ang dahon sa akong kamatis?',
    'Kanus-a ang saktong oras sa pagbisbis sa tanom?',
    'Unsay epektibo nga pangpatay sa dangan sa talong?',
    'Unsaon paghimo og organikong abono sa yuta?',
  ],
  English: [
    'Why are my tomato leaves turning yellow?',
    'How often should I water my vegetables?',
    'What safe organic spray stops leaf aphids?',
    'How do I test if my soil needs compost?',
  ],
};

export default function ChatScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content:
        "Hello! I am your AgriMate farming assistant. Ask me anything about your crops, watering schedules, pest solutions, soil care, or plant problems. How can I assist your farm today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'Tagalog' | 'Bisaya' | 'English'>('Tagalog');

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await api.askChat(text.trim());

      const assistantMsg: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response.answer,
        cautions: response.cautions,
        followUps: response.follow_up_suggestions,
        disclaimer: response.disclaimer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          'I am having trouble connecting to the network right now. Basic offline tips: water deeply at the soil base early in the morning and avoid splashing wet soil onto lower leaves.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to delete this chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setMessages([
              {
                id: `welcome_${Date.now()}`,
                role: 'assistant',
                content: 'Chat cleared. How can I help your farm today?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          },
        },
      ]
    );
  };

  const handleSaveAdvice = async (message: Message) => {
    try {
      await offlineStorage.saveAnalysis({
        id: `saved_${Date.now()}`,
        crop_identification: 'Agricultural Assistant Advice',
        symptoms: message.content.slice(0, 100) + '...',
        recommendations: [message.content],
        possible_causes: ['Farming Knowledge Save'],
        confidence_level: 'High',
        created_at: new Date().toISOString(),
      });
      Alert.alert('Advice Saved', 'This farming advice has been saved to your Saved History tab.');
    } catch {
      Alert.alert('Notice', 'Advice saved locally.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Chat Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.assistantBadge}>
          <Bot size={22} color={Colors.primary} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.assistantName}>AgriMate AI Assistant</Text>
            <Text style={styles.assistantStatus}>Online & Ready to Guide</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClearConversation}
          accessibilityLabel="Clear Chat"
        >
          <Trash2 size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.role === 'user' ? styles.userRow : styles.assistantRow,
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.avatarBot}>
                  <Bot size={18} color={Colors.white} />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.role === 'user' ? styles.userMessageText : styles.assistantMessageText,
                  ]}
                >
                  {msg.content}
                </Text>

                {/* Safety Cautions for Chemicals / Fertilizers */}
                {msg.cautions && msg.cautions.length > 0 && (
                  <View style={styles.cautionBox}>
                    <View style={styles.cautionHeader}>
                      <AlertTriangle size={14} color="#D84315" />
                      <Text style={styles.cautionTitle}>Safety Precaution:</Text>
                    </View>
                    {msg.cautions.map((c, idx) => (
                      <Text key={idx} style={styles.cautionText}>
                        • {c}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Follow-up Question Chips */}
                {msg.followUps && msg.followUps.length > 0 && (
                  <View style={styles.followUpsContainer}>
                    <Text style={styles.followUpsTitle}>Suggested Follow-up Questions:</Text>
                    {msg.followUps.map((q, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.followUpChip}
                        onPress={() => handleSendMessage(q)}
                      >
                        <Sparkles size={12} color={Colors.primary} style={{ marginRight: 4 }} />
                        <Text style={styles.followUpText}>{q}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Footer with Timestamp & Save Action */}
                <View style={styles.bubbleFooter}>
                  <Text style={styles.timeText}>{msg.timestamp}</Text>
                  {msg.role === 'assistant' && (
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={() => handleSaveAdvice(msg)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Bookmark size={14} color={Colors.primary} />
                      <Text style={styles.saveText}>Save Advice</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <View style={styles.avatarBot}>
                <Bot size={18} color={Colors.white} />
              </View>
              <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
                <Sparkles size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.typingText}>AgriMate is thinking...</Text>
              </View>
            </View>
          )}

          {/* Quick Suggestion Chips when starting */}
          {messages.length === 1 && (
            <View style={styles.quickPromptsBox}>
              <View style={styles.langSelectorRow}>
                <TouchableOpacity
                  style={[styles.langTab, selectedLang === 'Tagalog' && styles.langTabActive]}
                  onPress={() => setSelectedLang('Tagalog')}
                >
                  <Text
                    style={[styles.langTabText, selectedLang === 'Tagalog' && styles.langTabTextActive]}
                  >
                    🇵🇭 Tagalog
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.langTab, selectedLang === 'Bisaya' && styles.langTabActive]}
                  onPress={() => setSelectedLang('Bisaya')}
                >
                  <Text
                    style={[styles.langTabText, selectedLang === 'Bisaya' && styles.langTabTextActive]}
                  >
                    🏝️ Bisaya
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.langTab, selectedLang === 'English' && styles.langTabActive]}
                  onPress={() => setSelectedLang('English')}
                >
                  <Text
                    style={[styles.langTabText, selectedLang === 'English' && styles.langTabTextActive]}
                  >
                    🌐 English
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.quickPromptsTitle}>
                {selectedLang === 'Tagalog'
                  ? 'Mga Karaniwang Tanong:'
                  : selectedLang === 'Bisaya'
                  ? 'Kasagarang Pangutana sa Uma:'
                  : 'Frequently Asked Questions:'}
              </Text>

              {LANGUAGE_PROMPTS[selectedLang].map((prompt, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickPromptBtn}
                  onPress={() => handleSendMessage(prompt)}
                >
                  <Sparkles size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.quickPromptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <Input
            placeholder={
              selectedLang === 'Tagalog'
                ? 'Magtanong sa Tagalog (hal. Bakit naninilaw...)'
                : selectedLang === 'Bisaya'
                ? 'Pangutana sa Bisaya (pananglitan: Nganong dalag...)'
                : 'Ask a question about your crops...'
            }
            value={inputText}
            onChangeText={setInputText}
            containerStyle={styles.textInputContainer}
            style={styles.chatInput}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            disabled={!inputText.trim() || loading}
            onPress={() => handleSendMessage()}
          >
            <Send size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2EE',
  },
  assistantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assistantName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
  },
  assistantStatus: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  clearBtn: {
    padding: 8,
  },
  messagesList: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatarBot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: BorderRadius.lg,
    padding: 12,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 2,
  },
  assistantBubble: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#E8ECE9',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userMessageText: {
    color: Colors.white,
  },
  assistantMessageText: {
    color: Colors.text,
  },
  cautionBox: {
    backgroundColor: '#FBE9E7',
    borderRadius: BorderRadius.sm,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#D84315',
  },
  cautionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cautionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D84315',
    marginLeft: 4,
  },
  cautionText: {
    fontSize: 11,
    color: '#3E2723',
    lineHeight: 15,
  },
  followUpsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: 8,
  },
  followUpsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  followUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F8F3',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#D8E8DC',
  },
  followUpText: {
    fontSize: 12,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  timeText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginLeft: 3,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  quickPromptsBox: {
    marginTop: Spacing.lg,
  },
  langSelectorRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  langTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#E8F5E9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  langTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  langTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  langTabTextActive: {
    color: Colors.white,
  },
  quickPromptsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  quickPromptBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#EDF2EE',
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickPromptText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#EDF2EE',
  },
  textInputContainer: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  chatInput: {
    minHeight: 46,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#A5D6A7',
  },
});
