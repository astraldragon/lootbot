const { Command } = require("discord-akairo");
const { Loot } = require("../../models");
const { checkManagePermissions } = require("../../support");

module.exports = class LootRemove extends Command {
  constructor() {
    super("loot-remove", {
      aliases: ["loot-remove", "lr"],
      category: "Loot",
      channelRestriction: "guild",
      description: {
        content: "Remove that loot",
        examples: [`loot-remove "Maple Syrup"`, "loot-remove Syrup"],
        usage: "<name>"
      },
      options: {
        permissions: checkManagePermissions
      },
      args: [
        {
          id: "name",
          prompt: {
            start: "What is the name of the loot?"
          },
          type: "string"
        }
      ]
    });
  }

  async exec(msg, { name }) {
    const guild = msg.guild.id;

    try {
      const result = await Loot.destroy({
        where: { name, guild }
      });

      if (result === 0) {
        return msg.channel.send(`${name} not found`);
      } else {
        return msg.channel.send(`${name} removed`);
      }
    } catch (e) {
      return msg.channel.send(`An error occurred removing ${name}`);
    }
  }
};
