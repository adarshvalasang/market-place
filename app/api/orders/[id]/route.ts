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

// GET a single order by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_ORDERS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock data")
      const mockOrder = mockOrders.find((o) => o.id === params.id)
      if (mockOrder) {
        return NextResponse.json(mockOrder)
      }
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    try {
      console.log(`Attempting to fetch order ${params.id} from Airtable...`)
      console.log("Using table:", process.env.AIRTABLE_ORDERS_TABLE)

      const ordersTable = initAirtable()
      const record = await ordersTable.find(params.id)

      console.log("Successfully fetched order from Airtable")

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

      return NextResponse.json(order)
    } catch (airtableError) {
      console.error("Airtable error when fetching order:", airtableError)

      // Try to return mock data if available
      const mockOrder = mockOrders.find((o) => o.id === params.id)
      if (mockOrder) {
        console.warn("Falling back to mock order data")
        return NextResponse.json(mockOrder)
      }

      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching order:", error)

    // Try to return mock data if available
    const mockOrder = mockOrders.find((o) => o.id === params.id)
    if (mockOrder) {
      console.warn("Error occurred, returning mock order data")
      return NextResponse.json(mockOrder)
    }

    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
}

// PUT update an order
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_ORDERS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock response")
      const mockOrder = mockOrders.find((o) => o.id === params.id)
      if (mockOrder) {
        const updatedOrder = {
          ...mockOrder,
          ...body,
        }
        return NextResponse.json(updatedOrder)
      }
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    try {
      console.log(`Attempting to update order ${params.id} in Airtable...`)
      console.log("Using table:", process.env.AIRTABLE_ORDERS_TABLE)

      const ordersTable = initAirtable()

      // Get existing record to update only provided fields
      try {
        const existingRecord = await ordersTable.find(params.id)
        const existingData = {
          productId: existingRecord.get("productId"),
          productName: existingRecord.get("productName"),
          buyerName: existingRecord.get("buyerName"),
          buyerEmail: existingRecord.get("buyerEmail"),
          shippingAddress: existingRecord.get("shippingAddress"),
          quantity: existingRecord.get("quantity"),
          totalPrice: existingRecord.get("totalPrice"),
          status: existingRecord.get("status"),
        }

        // Merge existing data with updates
        const updateData = { ...existingData, ...body }

        console.log("Order data to be updated:", updateData)

        const record = await ordersTable.update(params.id, updateData)
        console.log("Order updated successfully in Airtable")

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

        return NextResponse.json(order)
      } catch (recordError) {
        console.error("Error finding existing record:", recordError)
        throw new Error("Could not find existing order")
      }
    } catch (airtableError) {
      console.error("Airtable error when updating order:", airtableError)

      // Fallback to mock data if Airtable fails
      const mockOrder = mockOrders.find((o) => o.id === params.id)
      if (mockOrder) {
        console.warn("Falling back to mock order update")
        const updatedOrder = {
          ...mockOrder,
          ...body,
        }
        return NextResponse.json(updatedOrder)
      }

      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}

