import prisma from "../../prisma/prisma.js";

class CardModel {
  // Obter todas as cartas
  async findAll(raridade, ataque, pagina, limite, name) {

    if (Number(pagina) < 1) {
      pagina = 1;   
    }
    if (Number(limite) < 1 || Number(limite) < 100) {
      limite = 10;   
    }

    const skip = (Number(pagina) - 1) * Number(limite);
  
    const where = {};

    if (raridade){
      where.rarity = raridade
    }

    if(ataque) {
      where.attackPoints = {
        gte: Number(ataque), // Maior ou igual ao valor de ataque fornecido
      }
    }

    if(name) {
      where.name = {
        contains: name, // Contém o nome fornecido (case insensitive)
      }
    }

    const cartas = await prisma.card.findMany({
      skip: 0, // Pular 0 cartas (pode ser usado para paginação)
      take: 10, // Quantidade de cartas a serem retornadas
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        collection: {
          select: {
            name: true,
            description: true,
            releaseYear: true,
          },
        },
      },
    });

    const totalExibidos = cartas.length; // Total de cartas retornadas
    const totalGeral = await prisma.card.count({
      where
    }); // Total geral de cartas no banco de dados

    // console.log(cartas);
    return { totalExibidos, totalGeral, cartas };

    return cartas;
  }

  // Obter uma carta pelo ID
  async findById(id) {
    const carta = await prisma.card.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        collection: true,
      },
    });

    return carta;
  }

  // Criar uma nova carta
  async create(
    name,
    rarity,
    attackPoints,
    defensePoints,
    imageUrl,
    collectionId
  ) {
    const novaCarta = await prisma.card.create({
      data: {
        name,
        rarity,
        attackPoints,
        defensePoints,
        imageUrl,
        collectionId: Number(collectionId),
      },
    });

    return novaCarta;
  }

  // Atualizar uma carta
  async update(
    id,
    name,
    rarity,
    attackPoints,
    defensePoints,
    imageUrl,
    collectionId
  ) {
    const carta = await this.findById(id);

    if (!carta) {
      return null;
    }

    // Atualize a carta existente com os novos dados
    const cartaAtualizada = await prisma.card.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        rarity,
        attackPoints,
        defensePoints,
        imageUrl,
        collectionId: Number(collectionId),
      },
    });

    return cartaAtualizada;
  }

  // Remover uma carta
  async delete(id) {
    const carta = await this.findById(id);

    if (!carta) {
      return null;
    }

    await prisma.card.delete({
      where: {
        id: Number(id),
      },
    });

    return true;
  }
}

export default new CardModel();
