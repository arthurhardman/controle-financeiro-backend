'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('savings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      targetAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currentAmount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: false
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('em_andamento', 'concluida', 'cancelada'),
        defaultValue: 'em_andamento'
      },
      description: {
        type: Sequelize.TEXT
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Índices
    await queryInterface.addIndex('savings', ['userId']);
    await queryInterface.addIndex('savings', ['deadline']);
    await queryInterface.addIndex('savings', ['category']);
    await queryInterface.addIndex('savings', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('savings');
  }
}; 