const chance = require("chance")();
const { RichEmbed } = require("discord.js");
const { Command } = require("discord-akairo");
const { Loot, Tier, Message } = require("../../models");

const {
  delay,
  formatMessage,
  checkManagePermissions
} = require("../../support");

async function sayMessage(message, msg, reward, user, tier) {
  return msg.channel.send(formatMessage(message, reward, user, tier));
}

async function sayReward(message, msg, reward, user, tier) {
  var embed = new RichEmbed()
    .setColor(tier.color)
    .setDescription(formatMessage(message, reward, user, tier))
    .setImage(tier.image);

  return msg.channel.send({ embed });
}

function randomMessage(messages, personalMessages, filter, defaultMessage) {
  let filtered = personalMessages.filter(message => filter(message));

  if (filtered.length === 0) {
    filtered = messages.filter(message => filter(message));
  }

  if (filtered.length === 0) {
    filtered = [defaultMessage];
  }

  return chance.pickone(filtered);
}

function removeRunningGame(guild, msg, runningGames) {
  if (runningGames) {
    const newRunningGames = [...runningGames];
    newRunningGames.splice(runningGames.indexOf(msg.channel.id, 1));
    return msg.client.settings.set(guild, "runningGames", newRunningGames);
  }

  return null;
}

const DEFAULT_MESSAGES = {
  intro: {
    message: "Drawing loot...",
    delay: 0
  },
  draw: {
    message: "<tier> prize won...",
    delay: 1000
  },
  reward: {
    message: "Congratulations <user>, you won <reward>",
    delay: 0
  }
};

module.exports = class LootOpen extends Command {
  constructor() {
    super("open", {
      aliases: ["open", "loot-open"],
      category: "Loot",
      channelRestriction: "guild",
      description: {
        content: "Opens a lootbox",
        examples: ["open", "loot-open"]
      },
      options: {
        permissions: checkManagePermissions
      },
      args: [
        {
          id: "user",
          prompt: {
            start: "Which user would you like to open a lootbox for?"
          },
          type: "member"
        },
        {
          id: "lucky",
          match: "flag",
          prefix: "lucky",
          default: false
        }
      ]
    });
  }

  async exec(msg, { user, lucky }) {
    const guild = msg.guild.id;
    let runningGames = null;

    try {
      runningGames = msg.client.settings.get(guild, "runningGames", []).slice();

      if (runningGames.includes(msg.channel.id)) {
        return msg.channel.send(
          "There is already a game running in this channel"
        );
      }

      const tiers = await Tier.findAll({
        include: [
          {
            model: Loot
          }
        ],
        where: { guild }
      });

      if (tiers.filter(tier => tier.Loots.length > 0).length === 0) {
        return msg.channel.send("No loot in the lootbox");
      }

      const weights = tiers.map(tier =>
        lucky ? tier.luckyWeight : tier.weight
      );
      const tier = chance.weighted(tiers, weights);

      if (tier.Loots.length === 0) {
        return msg.channel.send(
          `${tier.name} loot won, but no prizes are registered`
        );
      }

      runningGames.push(msg.channel.id);
      await msg.client.settings.set(guild, "runningGames", runningGames);

      const reward = chance.pickone(tier.Loots);

      const normalMessages = await Message.findAll({
        where: { guild, user_id: null }
      });

      const personalMessages = await Message.findAll({
        where: { guild, user_id: user.id }
      });

      const introMessage = randomMessage(
        normalMessages,
        personalMessages,
        myMessage => myMessage.type === "intro",
        DEFAULT_MESSAGES.intro
      );

      const tierMessage = randomMessage(
        normalMessages,
        personalMessages,
        myMessage => myMessage.tier_id === tier.id && myMessage.type === "draw",
        DEFAULT_MESSAGES.draw
      );

      const rewardMessage = randomMessage(
        normalMessages,
        personalMessages,
        myMessage => myMessage.type === "reward",
        DEFAULT_MESSAGES.reward
      );

      await sayMessage(introMessage.message, msg, reward, user, tier);
      await delay(introMessage.delay);
      await sayMessage(tierMessage.message, msg, reward, user, tier);
      await delay(tierMessage.delay);
      await sayReward(rewardMessage.message, msg, reward, user, tier);
      await removeRunningGame(guild, msg, runningGames);
    } catch (error) {
      await removeRunningGame(guild, msg, runningGames);
      return msg.channel.send("An error occurred opening a lootbox");
    }
  }
};
