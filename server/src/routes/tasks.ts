import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const tasksRouter = Router();

const taskSchema = z.object({
  crop_id: z.string().optional(),
  crop_name: z.string().optional(),
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  task_type: z.enum([
    'Watering',
    'Fertilizing',
    'Pest inspection',
    'Crop monitoring',
    'Planting',
    'Harvesting',
    'General',
  ]),
  priority: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  scheduled_at: z.string().min(1, 'Scheduled date/time is required'),
  status: z.enum(['Pending', 'Completed', 'Cancelled']).default('Pending'),
});

let inMemoryTasks: any[] = [];

// GET tasks for user
tasksRouter.get('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const statusFilter = req.query.status as string;
  const filterType = req.query.filter as string; // 'today', 'upcoming', 'all'
  let tasks = inMemoryTasks.filter((t) => t.user_id === req.userId);

  if (statusFilter) {
    tasks = tasks.filter((t) => t.status.toLowerCase() === statusFilter.toLowerCase());
  }

  if (filterType === 'today') {
    const todayStr = new Date().toISOString().split('T')[0];
    tasks = tasks.filter((t) => t.scheduled_at && t.scheduled_at.startsWith(todayStr));
  } else if (filterType === 'upcoming') {
    const now = new Date().toISOString();
    tasks = tasks.filter((t) => t.scheduled_at && t.scheduled_at >= now && t.status === 'Pending');
  }

  // Sort by scheduled date
  tasks.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return res.json(tasks);
});

// POST create task
tasksRouter.post('/', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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
tasksRouter.patch('/:id/complete', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const task = inMemoryTasks.find((t) => t.id === req.params.id && t.user_id === req.userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found or unauthorized.' });
  }

  task.status = 'Completed';
  task.completed_at = new Date().toISOString();
  return res.json(task);
});

// PUT update task
tasksRouter.put('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
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
tasksRouter.delete('/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const index = inMemoryTasks.findIndex((t) => t.id === req.params.id && t.user_id === req.userId);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found or unauthorized.' });
  }

  inMemoryTasks.splice(index, 1);
  return res.json({ message: 'Task deleted successfully.', id: req.params.id });
});
