const express = require('express');
const router = express.Router();
const { Saving, sequelize } = require('../models');
const { Op } = require('sequelize');
const auth = require('../middleware/auth');

// Listar todas as metas de economia do usuário
router.get('/', auth, async (req, res) => {
  try {
    const {
      category,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const where = { userId: req.user.id };

    if (category) where.category = category;
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: savings } = await Saving.findAndCountAll({
      where,
      order: [['deadline', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      savings,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Erro ao buscar metas:', error);
    res.status(500).json({ error: 'Erro ao buscar metas' });
  }
});

// Criar nova meta de economia
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      targetAmount,
      deadline,
      category,
      description,
    } = req.body;

    const saving = await Saving.create({
      name,
      targetAmount,
      currentAmount: 0,
      deadline,
      category,
      description,
      status: 'em_andamento',
      userId: req.user.id,
    });

    res.status(201).json(saving);
  } catch (error) {
    console.error('Erro ao criar meta:', error);
    res.status(500).json({ error: 'Erro ao criar meta' });
  }
});

// Atualizar meta de economia
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      targetAmount,
      currentAmount,
      deadline,
      category,
      status,
      description,
    } = req.body;

    const saving = await Saving.findOne({
      where: { id, userId: req.user.id },
    });

    if (!saving) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    // Atualiza o status para concluída se o valor atual atingir ou ultrapassar o valor alvo
    const newStatus = currentAmount >= targetAmount ? 'concluida' : status;

    await saving.update({
      name,
      targetAmount,
      currentAmount,
      deadline,
      category,
      status: newStatus,
      description,
    });

    res.json(saving);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(500).json({ error: 'Erro ao atualizar meta' });
  }
});

// Excluir meta de economia
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const saving = await Saving.findOne({
      where: { id, userId: req.user.id },
    });

    if (!saving) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    await saving.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir meta:', error);
    res.status(500).json({ error: 'Erro ao excluir meta' });
  }
});

// Adicionar valor à meta
router.post('/:id/add', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const saving = await Saving.findOne({
      where: { id, userId: req.user.id },
    });

    if (!saving) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    const newAmount = parseFloat(saving.currentAmount) + parseFloat(amount);
    const newStatus = newAmount >= saving.targetAmount ? 'concluida' : saving.status;

    await saving.update({
      currentAmount: newAmount,
      status: newStatus,
    });

    res.json(saving);
  } catch (error) {
    console.error('Erro ao adicionar valor:', error);
    res.status(500).json({ error: 'Erro ao adicionar valor' });
  }
});

// Obter estatísticas das economias
router.get('/stats', auth, async (req, res) => {
  try {
    // Buscar todas as metas do usuário
    const savings = await Saving.findAll({
      where: { userId: req.user.id },
    });

    // Calcular totais
    const stats = {
      totalSaved: savings.reduce((acc, saving) => acc + parseFloat(saving.currentAmount), 0),
      totalTarget: savings.reduce((acc, saving) => acc + parseFloat(saving.targetAmount), 0),
      categorias: {},
      status: {
        em_andamento: 0,
        concluida: 0,
      },
    };

    // Agrupar por categoria e status
    savings.forEach((saving) => {
      const category = saving.category;
      const status = saving.status;

      // Contar por status
      stats.status[status]++;

      // Agrupar por categoria
      if (!stats.categorias[category]) {
        stats.categorias[category] = {
          saved: 0,
          target: 0,
        };
      }
      stats.categorias[category].saved += parseFloat(saving.currentAmount);
      stats.categorias[category].target += parseFloat(saving.targetAmount);
    });

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

module.exports = router; 