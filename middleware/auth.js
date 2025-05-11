const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Obtém o token do header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verifica o token
    const decoded = jwt.verify(token, 'controle_financeiro_secret_key_2024');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
}; 