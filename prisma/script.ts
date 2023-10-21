import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const MobileCategory = await prisma.category.upsert({
        where: {
            name: 'Mobile Devices'
        },
        update: {},
        create: {
            name: 'Mobile Devices'
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Mobile Phones'
        },
        update: {},
        create: {
            name: 'Mobile Phones',
            parent_category: {
                connect: {id: MobileCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Tablets'
        },
        update: {},
        create: {
            name: 'Tablets',
            parent_category: {
                connect: {id: MobileCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Smart Watches'
        },
        update: {},
        create: {
            name: 'Smart Watches',
            parent_category: {
                connect: {id: MobileCategory.id}
            }
        }
    });

    const accessoriesCategory = await prisma.category.upsert({
        where: {
            name: 'Accessories'
        },
        update: {},
        create: {
            name: 'Accessories'
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Ear Phones'
        },
        update: {},
        create: {
            name: 'Ear Phones',
            parent_category: {
                connect: {id: accessoriesCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Chargers'
        },
        update: {},
        create: {
            name: 'Chargers',
            parent_category: {
                connect: {id: accessoriesCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Other Accessories'
        },
        update: {},
        create: {
            name: 'Other Accessories',
            parent_category: {
                connect: {id: accessoriesCategory.id}
            }
        }
    });

    const vehiclesCategory = await prisma.category.upsert({
        where: {
            name: 'Vehicles'
        },
        update: {},
        create: {
            name: 'Vehicles'
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Cars'
        },
        update: {},
        create: {
            name: 'Cars',
            parent_category: {
                connect: {id: vehiclesCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Bikes'
        },
        update: {},
        create: {
            name: 'Bikes',
            parent_category: {
                connect: {id: vehiclesCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Other Vehicles'
        },
        update: {},
        create: {
            name: 'Other Vehicles',
            parent_category: {
                connect: {id: vehiclesCategory.id}
            }
        }
    });

    const propertiesCategory = await prisma.category.upsert({
        where: {
            name: 'Properties'
        },
        update: {},
        create: {
            name: 'Properties'
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Houses'
        },
        update: {},
        create: {
            name: 'Houses',
            parent_category: {
                connect: {id: propertiesCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Land and Plots'
        },
        update: {},
        create: {
            name: 'Land and Plots',
            parent_category: {
                connect: {id: propertiesCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Other Properties'
        },
        update: {},
        create: {
            name: 'Other Properties',
            parent_category: {
                connect: {id: propertiesCategory.id}
            }
        }
    });

    await prisma.category.upsert({
        where: {
            name: 'Other Items'
        },
        update: {},
        create: {
            name: 'Other Items'
        }
    });

    prisma.ads.deleteMany();
    prisma.adImages.deleteMany();
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })