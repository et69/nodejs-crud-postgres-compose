const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Database connection
const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres'
});

// User Model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Task Model
const Task = sequelize.define('Task', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

// Sign up
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, password: hashedPassword });
        res.json({ message: 'User created successfully', user });
    } catch (error) {
        res.status(500).json({ error: 'User already exists or something went wrong' });
    }
});

// Log in
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });
});

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// Create Task
app.post('/tasks', authenticateJWT, async (req, res) => {
    const { title, description } = req.body;
    const task = await Task.create({ title, description, userId: req.user.userId });
    res.json({ message: 'Task created', task });
});

// Get Tasks
app.get('/tasks', authenticateJWT, async (req, res) => {
    const tasks = await Task.findAll({ where: { userId: req.user.userId } });
    res.json(tasks);
});

// Update Task
app.put('/tasks/:id', authenticateJWT, async (req, res) => {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    const { title, description } = req.body;
    task.title = title;
    task.description = description;
    await task.save();
    res.json({ message: 'Task updated', task });
});

// Delete Task
app.delete('/tasks/:id', authenticateJWT, async (req, res) => {
    const task = await Task.findOne({ where: { id: req.params.id, userId: req.user.userId } });
    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted' });
});

// Start server
const port = process.env.PORT || 3000;
sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
});

