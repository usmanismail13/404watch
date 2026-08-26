const prisma = require("../lib/prisma");

async function save404Error({ websiteId, url, sourceUrl }) {
  const existingError = await prisma.error404.findFirst({
    where: {
      websiteId,
      url,
    },
  });

  if (existingError) {
    return prisma.error404.update({
      where: {
        id: existingError.id,
      },
      data: {
        sourceUrl,
        status: "active",
      },
    });
  }

  return prisma.error404.create({
    data: {
      websiteId,
      url,
      sourceUrl,
      status: "active",
    },
  });
}

module.exports = {
  save404Error,
};
