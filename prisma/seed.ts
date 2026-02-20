import prisma from '../src/lib/prisma'

async function main() {
    const count = await prisma.product.count()
    if (count > 0) {
        console.log('Database already seeded')
        return
    }

    // Create settings first
    await prisma.setting.upsert({
        where: { key: 'whatsapp_number' },
        update: { value: '966500000000' },
        create: { key: 'whatsapp_number', value: '966500000000' }
    })

    await prisma.setting.upsert({
        where: { key: 'store_name' },
        update: { value: 'بسبوسة القرفة - Cinnamon Basbosa' },
        create: { key: 'store_name', value: 'بسبوسة القرفة - Cinnamon Basbosa' }
    })

    console.log('Seeded settings')

    // Create products
    await prisma.product.createMany({
        data: [
            {
                name: 'صينية بسبوسة قرفة كبيرة',
                price: 120,
                imagePath: '/products/basbosa-tray-1.jpg',
                description: 'صينية بسبوسة فاخرة بنكهة القرفة الغنية، مزينة بالمكسرات. مقدمة في أواني فخارية تقليدية. تكفي 8-10 أشخاص.'
            },
            {
                name: 'صينية بسبوسة قرفة وسط',
                price: 85,
                imagePath: '/products/basbosa-tray-2.jpg',
                description: 'الحجم المثالي للعائلة، بنكهة القرفة الأصيلة. تكفي 5-6 أشخاص.'
            },
            {
                name: 'بسبوسة قرفة فردية',
                price: 25,
                imagePath: '/products/basbosa-single-bowl.jpg',
                description: 'حصة فردية من البسبوسة بالقرفة في وعاء فخاري أنيق. مثالية كهدية أو للمناسبات الخاصة.'
            },
            {
                name: 'طقم بسبوسة قرفة (6 قطع)',
                price: 140,
                imagePath: '/products/basbosa-bowls.jpg',
                description: 'ست حصص فردية من البسبوسة بالقرفة مقدمة في صينية أنيقة. مثالي للضيافة والمناسبات.'
            },
        ]
    })
    console.log('Seeded products')
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
