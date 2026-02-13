require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting comprehensive seed process...');

    // Create users
    const adminEmail = 'admin@stockmaster.com';
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
          isActive: true,
        }
      });
      console.log('✅ Admin user created');
    }

    // Create test user for delivery operations
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'WAREHOUSE_STAFF',
        isActive: true,
      },
    });
    console.log('✅ Test user created:', testUser.email);

    // Create suppliers
    const suppliers = await prisma.supplier.createMany({
      data: [
        {
          name: 'Tata Electronics',
          code: 'TATA001',
          email: 'orders@tataelectronics.in',
          phone: '+91-22-12345678',
          address: '123 MG Road, Andheri East, Mumbai 400069'
        },
        {
          name: 'Reliance Supplies',
          code: 'REL002',
          email: 'supply@reliancesupplies.in',
          phone: '+91-80-87654321',
          address: '456 Brigade Road, Koramangala, Bangalore 560034'
        },
        {
          name: 'Mahindra Office Solutions',
          code: 'MAH003',
          email: 'procurement@mahindraoffice.in',
          phone: '+91-44-11223344',
          address: '789 Anna Salai, T Nagar, Chennai 600017'
        }
      ],
      skipDuplicates: true
    });
    console.log(`✅ Created ${suppliers.count} suppliers`);

    // Create categories (combine both sets)
    const categories = await prisma.productCategory.createMany({
      data: [
        { name: 'Electronics', description: 'Electronic devices and accessories' },
        { name: 'Office Supplies', description: 'Office stationery and supplies' },
        { name: 'Furniture', description: 'Office and home furniture' },
        { name: 'IT Equipment', description: 'Computer and IT hardware' },
        { name: 'Consumables', description: 'Consumable items' }
      ],
      skipDuplicates: true
    });
    console.log(`✅ Created ${categories.count} categories`);

    // Get created categories
    const electronicsCategory = await prisma.productCategory.findFirst({ where: { name: 'Electronics' } });
    const officeCategory = await prisma.productCategory.findFirst({ where: { name: 'Office Supplies' } });
    const furnitureCategory = await prisma.productCategory.findFirst({ where: { name: 'Furniture' } });
    const itCategory = await prisma.productCategory.findFirst({ where: { name: 'IT Equipment' } });

    // Create comprehensive product list - Indian products
    const products = [
      // Electronics
      { name: 'Wireless Mouse', sku: 'WM-001', description: 'Logitech wireless mouse with USB receiver', categoryId: electronicsCategory.id, unitOfMeasure: 'piece', initialStock: 150, reorderLevel: 50, reorderQuantity: 500 },
      { name: 'USB Cable', sku: 'UC-002', description: 'USB-C to USB-A cable, 2 meter', categoryId: electronicsCategory.id, unitOfMeasure: 'piece', initialStock: 300, reorderLevel: 100, reorderQuantity: 1000 },
      { name: 'Boat Headphones', sku: 'BH-003', description: 'Boat Rockerz wireless headphones', categoryId: electronicsCategory.id, unitOfMeasure: 'piece', initialStock: 80, reorderLevel: 20, reorderQuantity: 200 },

      // Office Supplies
      { name: 'A4 Paper Bundle', sku: 'CP-004', description: 'JK Copier 500 sheets A4 paper, 75gsm', categoryId: officeCategory.id, unitOfMeasure: 'ream', initialStock: 500, reorderLevel: 100, reorderQuantity: 1000 },
      { name: 'Cello Pen', sku: 'BP-005', description: 'Cello Gripper blue ballpoint pen', categoryId: officeCategory.id, unitOfMeasure: 'piece', initialStock: 1000, reorderLevel: 200, reorderQuantity: 2000 },
      { name: 'Kangaro Stapler', sku: 'ST-006', description: 'Kangaro HD-10D desktop stapler', categoryId: officeCategory.id, unitOfMeasure: 'piece', initialStock: 50, reorderLevel: 10, reorderQuantity: 100 },

      // IT Equipment
      { name: 'Laptop Stand', sku: 'LS-007', description: 'Portronics laptop stand', categoryId: itCategory.id, unitOfMeasure: 'piece', initialStock: 60, reorderLevel: 15, reorderQuantity: 150 },
      { name: 'Seagate HDD 1TB', sku: 'HD-008', description: 'Seagate external hard drive 1TB', categoryId: itCategory.id, unitOfMeasure: 'piece', initialStock: 120, reorderLevel: 25, reorderQuantity: 250 },

      // Furniture (for delivery operations)
      { name: 'Office Desk', sku: 'DESK001', description: 'Godrej office desk with drawers', categoryId: furnitureCategory.id, unitOfMeasure: 'unit', initialStock: 50, reorderLevel: 10, reorderQuantity: 20, isActive: true },
      { name: 'Revolving Chair', sku: 'CHAIR001', description: 'Featherlite ergonomic chair', categoryId: furnitureCategory.id, unitOfMeasure: 'unit', initialStock: 100, reorderLevel: 20, reorderQuantity: 50, isActive: true },
      { name: 'Meeting Table', sku: 'TABLE001', description: 'Nilkamal conference table 8 seater', categoryId: furnitureCategory.id, unitOfMeasure: 'unit', initialStock: 15, reorderLevel: 5, reorderQuantity: 10, isActive: true },
      { name: 'LED Desk Lamp', sku: 'DL-010', description: 'Philips LED desk lamp', categoryId: furnitureCategory.id, unitOfMeasure: 'piece', initialStock: 80, reorderLevel: 20, reorderQuantity: 200 },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { sku: product.sku },
        update: {},
        create: product
      });
    }
    console.log(`✅ Created ${products.length} products`);

    // Create warehouses - Indian locations
    const warehouses = [
      { name: 'Mumbai Central Warehouse', code: 'MUM01', address: 'Plot 45, MIDC Andheri, Mumbai, Maharashtra 400093', isActive: true },
      { name: 'Bangalore Distribution Hub', code: 'BLR02', address: '123 Industrial Area, Peenya, Bangalore, Karnataka 560058', isActive: true },
      { name: 'Delhi NCR Facility', code: 'DEL03', address: 'Sector 63, Noida, Uttar Pradesh 201301', isActive: true },
    ];

    for (const warehouse of warehouses) {
      await prisma.warehouse.upsert({
        where: { code: warehouse.code },
        update: {},
        create: warehouse
      });
    }
    console.log(`✅ Created ${warehouses.length} warehouses`);

    // Get created warehouses
    const mainWarehouse = await prisma.warehouse.findUnique({ where: { code: 'MUM01' } });
    const northWarehouse = await prisma.warehouse.findUnique({ where: { code: 'BLR02' } });
    const westWarehouse = await prisma.warehouse.findUnique({ where: { code: 'DEL03' } });

    // Create locations
    const locations = [
      // Mumbai Warehouse locations
      { name: 'Rack A1', code: 'MUM-A-01', warehouseId: mainWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Rack A2', code: 'MUM-A-02', warehouseId: mainWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Rack B1', code: 'MUM-B-01', warehouseId: mainWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Rack B2', code: 'MUM-B-02', warehouseId: mainWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Receiving Area', code: 'MUM-REC-01', warehouseId: mainWarehouse.id, type: 'RECEIVING', isActive: true },
      { name: 'Dispatch Area', code: 'MUM-SHIP-01', warehouseId: mainWarehouse.id, type: 'SHIPPING', isActive: true },

      // Bangalore Hub locations
      { name: 'Zone 1', code: 'BLR-Z1', warehouseId: northWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Zone 2', code: 'BLR-Z2', warehouseId: northWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Zone 3', code: 'BLR-Z3', warehouseId: northWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Inward Dock', code: 'BLR-REC-01', warehouseId: northWarehouse.id, type: 'RECEIVING', isActive: true },

      // Delhi NCR locations
      { name: 'Block A', code: 'DEL-A', warehouseId: westWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Block B', code: 'DEL-B', warehouseId: westWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'Block C', code: 'DEL-C', warehouseId: westWarehouse.id, type: 'STORAGE', isActive: true },
      { name: 'QC Area', code: 'DEL-QC-01', warehouseId: westWarehouse.id, type: 'QUARANTINE', isActive: true }
    ];

    for (const location of locations) {
      await prisma.location.upsert({
        where: { code: location.code },
        update: {},
        create: location
      });
    }
    console.log(`✅ Created ${locations.length} locations`);

    // Create customer for delivery
    const customer = await prisma.customer.upsert({
      where: { code: 'CUST001' },
      update: {},
      create: {
        name: 'Infosys Technologies',
        code: 'CUST001',
        email: 'procurement@infosys.com',
        phone: '+91-80-23456789',
        address: 'Electronics City, Bangalore, Karnataka 560100',
        isActive: true,
      },
    });
    console.log('✅ Customer created:', customer.name);

    // Get products for stock and delivery
    const createdProducts = await prisma.product.findMany();
    const createdLocations = await prisma.location.findMany();
    const stockLocation1 = await prisma.location.findUnique({ where: { code: 'MUM-A-01' } });
    const desk = await prisma.product.findUnique({ where: { sku: 'DESK001' } });
    const chair = await prisma.product.findUnique({ where: { sku: 'CHAIR001' } });
    const table = await prisma.product.findUnique({ where: { sku: 'TABLE001' } });

    // Create stock locations for all products
    const stockData = [];
    for (let i = 0; i < createdProducts.length; i++) {
      const product = createdProducts[i];
      const locationsToStock = createdLocations.slice(i * 2, (i * 2) + 3);

      for (const location of locationsToStock) {
        const quantity = Math.floor(Math.random() * 200) + 50;
        stockData.push({ productId: product.id, locationId: location.id, quantity });
      }
    }

    // Add specific stock for delivery products
    if (desk && chair && table && stockLocation1) {
      stockData.push(
        { productId: desk.id, locationId: stockLocation1.id, quantity: 50 },
        { productId: chair.id, locationId: stockLocation1.id, quantity: 100 },
        { productId: table.id, locationId: stockLocation1.id, quantity: 15 }
      );
    }

    for (const stock of stockData) {
      await prisma.stockLocation.upsert({
        where: {
          productId_locationId: {
            productId: stock.productId,
            locationId: stock.locationId
          }
        },
        update: { quantity: stock.quantity },
        create: {
          productId: stock.productId,
          locationId: stock.locationId,
          quantity: stock.quantity,
          reserved: 0,
          available: stock.quantity
        }
      });
    }
    console.log(`✅ Created ${stockData.length} stock locations`);

    // Create sample stock ledger entries
    for (let i = 0; i < 20; i++) {
      const randomStock = stockData[Math.floor(Math.random() * stockData.length)];
      const movementTypes = ['IN', 'OUT'];
      const documentTypes = ['RECEIPT', 'ADJUSTMENT', 'TRANSFER'];
      const randomMovementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
      const randomDocumentType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
      const quantity = Math.floor(Math.random() * 50) + 1;
      const balanceBefore = randomStock.quantity;
      const balanceAfter = randomMovementType === 'OUT' ? balanceBefore - quantity : balanceBefore + quantity;

      await prisma.stockLedger.create({
        data: {
          productId: randomStock.productId,
          locationId: randomStock.locationId,
          documentType: randomDocumentType,
          documentId: `DOC-${Date.now()}-${i}`,
          movementType: randomMovementType,
          quantity: randomMovementType === 'OUT' ? -quantity : quantity,
          balanceBefore,
          balanceAfter,
          reference: `Initial stock ledger - ${randomDocumentType}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        }
      });
    }
    console.log('✅ Created 20 sample stock ledger entries');

    // Create delivery orders
    if (desk && chair && table && stockLocation1) {
      await prisma.deliveryOrder.create({
        data: {
          deliveryNumber: 'WH/OUT/0001',
          customerId: customer.id,
          locationId: stockLocation1.id,
          status: 'READY',
          scheduledDate: new Date('2025-11-25'),
          notes: 'Urgent delivery for Azure Interior',
          userId: testUser.id,
          lines: {
            create: [{ productId: desk.id, quantity: 6, picked: 6, packed: 6, delivered: 0, notes: 'Handle with care' }]
          },
        },
      });

      await prisma.deliveryOrder.create({
        data: {
          deliveryNumber: 'WH/OUT/0002',
          customerId: customer.id,
          locationId: stockLocation1.id,
          status: 'WAITING',
          scheduledDate: new Date('2025-11-26'),
          notes: 'Regular delivery',
          userId: testUser.id,
          lines: {
            create: [
              { productId: chair.id, quantity: 20, picked: 0, packed: 0, delivered: 0 },
              { productId: table.id, quantity: 3, picked: 0, packed: 0, delivered: 0 }
            ]
          },
        },
      });

      await prisma.deliveryOrder.create({
        data: {
          deliveryNumber: 'WH/OUT/0003',
          customerId: customer.id,
          locationId: stockLocation1.id,
          status: 'DRAFT',
          scheduledDate: new Date('2025-11-28'),
          notes: 'Pending approval',
          userId: testUser.id,
          lines: {
            create: [{ productId: desk.id, quantity: 10, picked: 0, packed: 0, delivered: 0 }]
          },
        },
      });
      console.log('✅ Created 3 delivery orders');
    }

    console.log('🎉 Comprehensive seed completed successfully!');
    console.log(`
📊 Summary:
- Admin User: ${adminEmail} (password: admin123)
- Test User: test@example.com (password: password123)
- ${warehouses.length} Warehouses
- ${locations.length} Locations
- ${products.length} Products
- ${stockData.length} Stock Locations
- 20 Stock Ledger Records
- 3 Suppliers
- 5 Categories
- 1 Customer
- 3 Delivery Orders

🚀 You can now start the application and test both inventory AND delivery features!
    `);

  } catch (error) {
    console.error('❌ Error during seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
