import { type NextRequest, NextResponse } from "next/server"
import Airtable from "airtable"

// Initialize Airtable with better error handling
const initAirtable = () => {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableName = process.env.AIRTABLE_ORDERS_TABLE || "Orders"

    if (!apiKey || !baseId) {
      console.error("Airtable API key or Base ID is missing")
      throw new Error("Airtable configuration is incomplete")
    }

    console.log("Initializing Airtable with table:", tableName)
    const base = new Airtable({ apiKey }).base(baseId)
    return base.table(tableName)
  } catch (error) {
    console.error("Failed to initialize Airtable:", error)
    throw error
  }
}

// Mock data for development
const mockOrders = [
  {
    id: "order_1",
    productId: "prod_1",
    productName: "Wireless Headphones",
    buyerName: "John Doe",
    buyerEmail: "john@example.com",
    shippingAddress: "123 Main St, City, Country",
    quantity: 1,
    totalPrice: 129.99,
    status: "pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "order_2",
    productId: "prod_2",
    productName: "Smart Watch",
    buyerName: "Jane Smith",
    buyerEmail: "jane@example.com",
    shippingAddress: "456 Oak Ave, Town, Country",
    quantity: 1,
    totalPrice: 199.99,
    status: "shipped",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
]

// GET all orders
export async function GET(request: NextRequest) {
  try {
    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_ORDERS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock data")
      return NextResponse.json(mockOrders)
    }

    try {
      console.log("Attempting to fetch orders from Airtable...")
      console.log("Using table:", process.env.AIRTABLE_ORDERS_TABLE)

      const ordersTable = initAirtable()
      const records = await ordersTable.select().all()

      console.log(`Successfully fetched ${records.length} orders from Airtable`)

      const orders = records.map((record) => ({
        id: record.id,
        productId: record.get("productId"),
        productName: record.get("productName"),
        buyerName: record.get("buyerName"),
        buyerEmail: record.get("buyerEmail"),
        shippingAddress: record.get("shippingAddress"),
        quantity: record.get("quantity"),
        totalPrice: record.get("totalPrice"),
        status: record.get("status"),
        createdAt: record.get("createdAt"),
      }))

      return NextResponse.json(orders)
    } catch (airtableError) {
      console.error("Airtable error when fetching orders:", airtableError)

      // Fallback to mock data if Airtable fails
      console.warn("Falling back to mock order data")
      return NextResponse.json(mockOrders)
    }
  } catch (error) {
    console.error("Error fetching orders:", error)

    // Return mock data if there's an error
    console.warn("Error occurred, returning mock order data")
    return NextResponse.json(mockOrders)
  }
}

// POST create a new order
export async function POST(request: NextRequest) {
  let body
  try {
    body = await request.json()

    // Validate required fields
    if (!body.productId || !body.buyerName || !body.buyerEmail || !body.shippingAddress) {
      return NextResponse.json(
        { error: "Product ID, buyer name, email, and shipping address are required" },
        { status: 400 },
      )
    }

    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_ORDERS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock response")
      const mockOrder = {
        id: `order_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      }
      console.log("Created mock order:", mockOrder)
      return NextResponse.json(mockOrder, { status: 201 })
    }

    try {
      console.log("Attempting to create order in Airtable...")
      console.log("Using table:", process.env.AIRTABLE_ORDERS_TABLE)

      // Prepare the record data
      const recordData = {
        productId: body.productId,
        productName: body.productName,
        buyerName: body.buyerName,
        buyerEmail: body.buyerEmail,
        shippingAddress: body.shippingAddress,
        quantity: body.quantity || 1,
        totalPrice: body.totalPrice,
        status: body.status || "pending",
        createdAt: new Date().toISOString(),
      }

      console.log("Order data to be created:", recordData)

      // Check if the table exists before trying to create a record
      try {
        const ordersTable = initAirtable()

        // Attempt to create the record
        const record = await ordersTable.create(recordData)
        console.log("Order created successfully in Airtable")

        const order = {
          id: record.id,
          productId: record.get("productId"),
          productName: record.get("productName"),
          buyerName: record.get("buyerName"),
          buyerEmail: record.get("buyerEmail"),
          shippingAddress: record.get("shippingAddress"),
          quantity: record.get("quantity"),
          totalPrice: record.get("totalPrice"),
          status: record.get("status"),
          createdAt: record.get("createdAt"),
        }

        return NextResponse.json(order, { status: 201 })
      } catch (tableError) {
        console.error("Error accessing Airtable table:", tableError)
        throw new Error("Could not access Airtable table")
      }
    } catch (airtableError) {
      console.error("Airtable error when creating order:", airtableError)

      // Fallback to mock data if Airtable fails
      console.warn("Falling back to mock order creation")
      const mockOrder = {
        id: `order_${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
      }
      return NextResponse.json(mockOrder, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating order:", error)

    // Return a mock order as fallback
    const mockOrder = {
      id: `order_${Date.now()}`,
      ...(body || {}),
      createdAt: new Date().toISOString(),
    }
    console.log("Using mock order due to error:", mockOrder)
    return NextResponse.json(mockOrder, { status: 201 })
  }
}

