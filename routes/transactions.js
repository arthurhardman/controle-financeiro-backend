const express = require('express');
const router = express.Router();
const { Transaction, User } = require('../models');
const auth = require('../middleware/auth');
const { Op, Sequelize } = require('sequelize');

// Listar todas as transações do usuário
router.get('/', auth, async (req, res) => {
  try {
    const {
      search,
      category,
      type,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const where = { userId: req.user.id };

    if (search) {
      where.description = { [Op.like]: `%${search}%` };
    }
    if (category) where.category = category;
    if (type) where.type = type;
    if (status) where.status = status;
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate],
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      order: [['date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      transactions,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
});

// Obter estatísticas das transações
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Estatísticas totais (sem filtro de status)
    const totalStats = await Transaction.findAll({
      where: { userId },
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "type" = \'receita\' THEN CAST(amount AS FLOAT) ELSE 0 END')), 0), 'totalIncome'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "type" = \'despesa\' THEN CAST(amount AS FLOAT) ELSE 0 END')), 0), 'totalExpense'],
      ],
      raw: true,
    });

    

    // Estatísticas do mês atual
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyStats = await Transaction.findAll({
      where: {
        userId,
        date: {
          [Op.between]: [firstDayOfMonth, lastDayOfMonth],
        },
      },
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "type" = \'receita\' THEN CAST(amount AS FLOAT) ELSE 0 END')), 0), 'monthlyIncome'],
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.literal('CASE WHEN "type" = \'despesa\' THEN CAST(amount AS FLOAT) ELSE 0 END')), 0), 'monthlyExpense'],
      ],
      raw: true,
    });

    // Garantir que temos valores padrão mesmo se não houver dados
    const stats = {
      totalIncome: parseFloat(totalStats[0]?.totalIncome || 0),
      totalExpense: parseFloat(totalStats[0]?.totalExpense || 0),
      monthlyIncome: parseFloat(monthlyStats[0]?.monthlyIncome || 0),
      monthlyExpense: parseFloat(monthlyStats[0]?.monthlyExpense || 0),
    };

    stats.balance = stats.totalIncome - stats.totalExpense;
    stats.monthlyBalance = stats.monthlyIncome - stats.monthlyExpense;

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar estatísticas',
      details: error.message 
    });
  }
});

// Criar nova transação
router.post('/', auth, async (req, res) => {
  try {
    const { description, amount, type, category, date, status } = req.body;
    const transaction = await Transaction.create({
      description,
      amount,
      type,
      category,
      date,
      status: status || 'pendente',
      userId: req.user.id
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Atualizar transação
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    const { description, amount, type, category, date, status } = req.body;
    await transaction.update({
      description,
      amount,
      type,
      category,
      date,
      status: status || transaction.status
    });

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Deletar transação
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOne({
      where: { id, userId: req.user.id }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await transaction.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 