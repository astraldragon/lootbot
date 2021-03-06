const { Command } = require("discord-akairo");
const { Tier, Message } = require("../../models");
const { checkManagePermissions } = require("../../support");

module.exports = class MessageList extends Command {
  constructor() {
    super("message:list", {
      aliases: ["message-list", "ml"],
      category: "Message",
      channelRestriction: "guild",
      description: {
        content: "List the glorious messages",
        examples: ["message-list"]
      },
      options: {
        permissions: checkManagePermissions
      }
    });
  }

  async exec(msg) {
    const guild = msg.guild.id;

    try {
      let messages = await Message.findAll({
        include: [
          {
            model: Tier
          }
        ],
        where: { guild }
      });

      if (messages.length === 0) {
        return msg.channel.send("No messages found");
      }

      let list = "";

      messages.forEach(message => {
        list += `
__**${message.name}**__
Message: ${message.message}
Type: ${message.type}
Tier: ${message.Tier ? message.Tier.name : "N/A"}
User: ${message.user_id || "N/A"}
`;
      });

      return msg.channel.send(list);
    } catch (error) {
      return msg.channel.send("An error occurred listing messages");
    }
  }
};
