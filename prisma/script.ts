import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const MobileCategory = await prisma.categories.upsert({
        where: {
            name: 'Mobile Devices'
        },
        update: {},
        create: {
            name: 'Mobile Devices',
            has_childs: true,
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Mobile Phones'
        },
        update: {},
        create: {
            name: 'Mobile Phones',
            has_childs: false,
            parent_category: {
                connect: {id: MobileCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Tablets'
        },
        update: {},
        create: {
            name: 'Tablets',
            has_childs: false,
            parent_category: {
                connect: {id: MobileCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Smart Watches'
        },
        update: {},
        create: {
            name: 'Smart Watches',
            has_childs: false,
            parent_category: {
                connect: {id: MobileCategory.id}
            }
        }
    });

    const accessoriesCategory = await prisma.categories.upsert({
        where: {
            name: 'Accessories',
        },
        update: {},
        create: {
            name: 'Accessories',
            has_childs: true,
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Ear Phones',
        },
        update: {},
        create: {
            name: 'Ear Phones',
            has_childs: false,
            parent_category: {
                connect: {id: accessoriesCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Chargers',
        },
        update: {},
        create: {
            name: 'Chargers',
            has_childs: false,
            parent_category: {
                connect: {id: accessoriesCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Other Accessories',
        },
        update: {},
        create: {
            name: 'Other Accessories',
            has_childs: false,
            parent_category: {
                connect: {id: accessoriesCategory.id}
            }
        }
    });

    const vehiclesCategory = await prisma.categories.upsert({
        where: {
            name: 'Vehicles',
        },
        update: {},
        create: {
            name: 'Vehicles',
            has_childs: true,
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Cars',
        },
        update: {},
        create: {
            name: 'Cars',
            has_childs: false,
            parent_category: {
                connect: {id: vehiclesCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Bikes',
        },
        update: {},
        create: {
            name: 'Bikes',
            has_childs: false,
            parent_category: {
                connect: {id: vehiclesCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Other Vehicles',
        },
        update: {},
        create: {
            name: 'Other Vehicles',
            has_childs: false,
            parent_category: {
                connect: {id: vehiclesCategory.id}
            }
        }
    });

    const propertiesCategory = await prisma.categories.upsert({
        where: {
            name: 'Properties',
        },
        update: {},
        create: {
            name: 'Properties',
            has_childs: true,
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Houses',
        },
        update: {},
        create: {
            name: 'Houses',
            has_childs: false,
            parent_category: {
                connect: {id: propertiesCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Land and Plots',
        },
        update: {},
        create: {
            name: 'Land and Plots',
            has_childs: false,
            parent_category: {
                connect: {id: propertiesCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Other Properties',
        },
        update: {},
        create: {
            name: 'Other Properties',
            has_childs: false,
            parent_category: {
                connect: {id: propertiesCategory.id}
            }
        }
    });

    await prisma.categories.upsert({
        where: {
            name: 'Other Items',
        },
        update: {},
        create: {
            name: 'Other Items',
            has_childs: false,
        }
    });

    prisma.ads.deleteMany();
    prisma.adImages.deleteMany();
    prisma.refreshTokens.deleteMany();
    prisma.users.deleteMany();
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