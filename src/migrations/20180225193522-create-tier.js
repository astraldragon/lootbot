module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "Tiers",
      {
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
        color: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        image: {
          type: Sequelize.STRING,
          allowNull: false
        },
        weight: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        luckyWeight: {
          type: Sequelize.FLOAT,
          allowNull: false
        },
        guild: {
          type: Sequelize.STRING,
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        deletedAt: {
          type: Sequelize.DATE
        }
      },
      {
        uniqueKeys: {
          tier_unique: {
            fields: ["name", "guild", "deletedAt"],
            customIndex: true
          }
        }
      }
    );
  },
  down: queryInterface => {
    return queryInterface.dropTable("Tiers");
  }
};
