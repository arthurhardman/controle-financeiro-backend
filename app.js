const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize, User, Transaction, Saving } = require('./models');
const path = require('path');
require('dotenv').config();

// Definir JWT_SECRET diretamente
process.env.JWT_SECRET = 'controle_financeiro_secret_key_2024';

const app = express();

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://controle-financeiro-front-7egq.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.disable('x-powered-by');

app.use(helmet());

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/savings', require('./routes/savings'));

// Rota para verificar se a API está online
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Verificar e executar migrações pendentes em produção
if (process.env.NODE_ENV === 'production') {
  const { exec } = require('child_process');
  console.log('Verificando migrações pendentes...');
  exec('npx sequelize-cli db:migrate', (error, stdout, stderr) => {
    if (error) {
      console.error('Erro ao executar migrações:', error);
      return;
    }
    if (stderr) {
      console.error('Erro:', stderr);
      return;
    }
    console.log('Migrações executadas com sucesso:', stdout);
  });
}

// Sincronizar banco de dados (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  sequelize.sync({ alter: true })
    .then(() => console.log('Banco de dados sincronizado'))
    .catch(err => console.error('Erro ao sincronizar banco de dados:', err));
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
}); 