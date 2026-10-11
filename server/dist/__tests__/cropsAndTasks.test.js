"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const crops_js_1 = require("../routes/crops.js");
const tasks_js_1 = require("../routes/tasks.js");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/crops', crops_js_1.cropsRouter);
app.use('/api/tasks', tasks_js_1.tasksRouter);
describe('Crops & Farming Tasks Endpoints', () => {
    const authHeader = 'Bearer dev-token-test-user';
    let createdCropId = '';
    test('POST /api/crops validates required fields and creates a crop record', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/crops')
            .set('Authorization', authHeader)
            .send({
            crop_name: 'Roma Tomatoes',
            variety: 'Heirloom determinate',
            planting_date: '2026-03-15',
            expected_harvest_date: '2026-07-20',
            plot_size: 1.5,
            plot_size_unit: 'acres',
            growth_stage: 'Vegetative',
            status: 'Active',
            notes: 'Drip irrigation installed along rows.',
        });
        expect(res.status).toBe(201);
        expect(res.body.crop_name).toBe('Roma Tomatoes');
        expect(res.body.id).toBeDefined();
        createdCropId = res.body.id;
    });
    test('POST /api/crops fails when crop name is empty', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/crops')
            .set('Authorization', authHeader)
            .send({
            variety: 'No name given',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation failed');
    });
    test('GET /api/crops returns authenticated user crops', async () => {
        const res = await (0, supertest_1.default)(app)
            .get('/api/crops')
            .set('Authorization', authHeader);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
    test('POST /api/tasks creates a task linked to the crop', async () => {
        const res = await (0, supertest_1.default)(app)
            .post('/api/tasks')
            .set('Authorization', authHeader)
            .send({
            crop_id: createdCropId,
            title: 'Morning Drip Watering',
            task_type: 'Watering',
            priority: 'High',
            scheduled_at: new Date().toISOString(),
            description: 'Run zone 1 irrigation for 35 minutes.',
        });
        expect(res.status).toBe(201);
        expect(res.body.title).toBe('Morning Drip Watering');
        expect(res.body.status).toBe('Pending');
    });
    test('PATCH /api/tasks/:id/complete marks task completed', async () => {
        // Create task
        const createRes = await (0, supertest_1.default)(app)
            .post('/api/tasks')
            .set('Authorization', authHeader)
            .send({
            title: 'Fertilize with Compost Tea',
            task_type: 'Fertilizing',
            priority: 'Medium',
            scheduled_at: new Date().toISOString(),
        });
        const taskId = createRes.body.id;
        const patchRes = await (0, supertest_1.default)(app)
            .patch(`/api/tasks/${taskId}/complete`)
            .set('Authorization', authHeader);
        expect(patchRes.status).toBe(200);
        expect(patchRes.body.status).toBe('Completed');
        expect(patchRes.body.completed_at).toBeDefined();
    });
});
