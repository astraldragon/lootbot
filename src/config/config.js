const logger = require("../logger");

module.exports = {
  development: {
    dialect: "sqlite",
    storage: "lootbot.sqlite",
    operatorsAliases: false,
    seederStorage: "sequelize",
    logging: msg => logger.info(msg)
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    operatorsAliases: false,
    seederStorage: "sequelize",
    logging: msg => logger.info(msg)
  }
};
