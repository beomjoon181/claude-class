import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient();

(async () => {
    // 여러 개 데이터 추가
    // .createMany()
    const names = ["노트북", "키보드", "마우스", "모니터", "헤드셋", "스피커", "웹캠", "태블릿", "스마트폰", "충전기"]

    const products = []
    for (let i = 1; i <= 100; i++) {
        const deliveryDate = new Date()
        deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 7) + 1) // 오늘 기준 1~7일 후

        products.push({
            productName: `${names[i % names.length]} ${i}호`,
            productPrice: (Math.floor(Math.random() * 100) + 1) * 1000, // 1,000 ~ 100,000원
            productStock: Math.floor(Math.random() * 101), // 0 ~ 100개
            productDelivery: deliveryDate,
        })
    }

    const createdProducts = await prisma.product.createMany({
        data: products
    })

    console.log(createdProducts) // { count: 100 }

})()
