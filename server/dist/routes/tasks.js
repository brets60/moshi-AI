"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_js_1 = require("../middleware/auth.js");
exports.tasksRouter = (0, express_1.Router)();
const taskSchema = zod_1.z.object({
    crop_id: zod_1.z.string().optional(),
    crop_name: zod_1.z.string().optional(),
    title: zod_1.z.string().min(1, 'Task title is required'),
    description: zod_1.z.string().optional(),
    task_type: zod_1.z.enum([
        'Watering',
        'Fertilizing',
        'Pest inspection',
        'Crop monitoring',
        'Planting',
        'Harvesting',
        'General',
    ]),
    priority: zod_1.z.enum(['Low', 'Medium', 'High']).default('Medium'),
    scheduled_at: zod_1.z.string().min(1, 'Scheduled date/time is required'),
    status: zod_1.z.enum(['Pending', 'Completed', 'Cancelled']).default('Pending'),
});
let inMemoryTasks = [];
// GET tasks for user
exports.tasksRouter.get('/', auth_js_1.requireAuth, (req, res) => {
    const statusFilter = req.query.status;
    const filterType = req.query.filter; // 'today', 'upcoming', 'all'
    let tasks = inMemoryTasks.filter((t) => t.user_id === req.userId);
    if (statusFilter) {
        tasks = tasks.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (filterType === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        tasks = tasks.filter((t) => t.scheduled_at && t.scheduled_at.startsWith(todayStr));
    }
    else if (filterType === 'upcoming') {
        const now = new Date().toISOString();
        tasks = tasks.filter((t) => t.scheduled_at && t.scheduled_at >= now && t.status === 'Pending');
    }
    // Sort by scheduled date
    tasks.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
    return res.json(tasks);
});
// POST create task
exports.tasksRouter.post('/', auth_js_1.requireAuth, (req, res) => {
    const validation = taskSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    const newTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        user_id: req.userId,
        ...validation.data,
        completed_at: null,
        created_at: new Date().toISOString(),
    };
    inMemoryTasks.push(newTask);
    return res.status(201).json(newTask);
});
// PATCH complete task
exports.tasksRouter.patch('/:id/complete', auth_js_1.requireAuth, (req, res) => {
    const task = inMemoryTasks.find((t) => t.id === req.params.id && t.user_id === req.userId);
    if (!task) {
        return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }
    task.status = 'Completed';
    task.completed_at = new Date().toISOString();
    return res.json(task);
});
// PUT update task
exports.tasksRouter.put('/:id', auth_js_1.requireAuth, (req, res) => {
    const index = inMemoryTasks.findIndex((t) => t.id === req.params.id && t.user_id === req.userId);
    if (index === -1) {
        return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }
    const validation = taskSchema.partial().safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: 'Validation failed', details: validation.error.format() });
    }
    inMemoryTasks[index] = {
        ...inMemoryTasks[index],
        ...validation.data,
    };
    return res.json(inMemoryTasks[index]);
});
// DELETE task
exports.tasksRouter.delete('/:id', auth_js_1.requireAuth, (req, res) => {
    const index = inMemoryTasks.findIndex((t) => t.id === req.params.id && t.user_id === req.userId);
    if (index === -1) {
        return res.status(404).json({ error: 'Task not found or unauthorized.' });
    }
    inMemoryTasks.splice(index, 1);
    return res.json({ message: 'Task deleted successfully.', id: req.params.id });
});
