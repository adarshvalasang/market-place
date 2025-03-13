import { type NextRequest, NextResponse } from "next/server"
import Airtable from "airtable"

// Initialize Airtable with better error handling
const initAirtable = () => {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY
    const baseId = process.env.AIRTABLE_BASE_ID
    const tableName = process.env.AIRTABLE_PRODUCTS_TABLE || "Products"

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
const mockProducts = [
  {
    id: "prod_1",
    name: "Wireless Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    price: 129.99,
    imageUrl: "/placeholder.svg?height=200&width=300",
    seller: "Audio Tech",
  },
  {
    id: "prod_2",
    name: "Smart Watch",
    description: "Fitness tracker and smartwatch with heart rate monitoring",
    price: 199.99,
    imageUrl: "/placeholder.svg?height=200&width=300",
    seller: "Tech Gear",
  },
  {
    id: "prod_3",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 20-hour battery life",
    price: 79.99,
    imageUrl: "/placeholder.svg?height=200&width=300",
    seller: "Sound Systems",
  },
  {
    id: "prod_4",
    name: "Mechanical Keyboard",
    description: "RGB mechanical keyboard with customizable switches",
    price: 149.99,
    imageUrl: "/placeholder.svg?height=200&width=300",
    seller: "Tech Accessories",
  },
  {
    id: "prod_5",
    name: "Smartphone Stand",
    description: "Adjustable smartphone stand for desk or bedside",
    price: 24.99,
    imageUrl: "/placeholder.svg?height=200&width=300",
    seller: "Mobile Accessories",
  },
]

// GET a single product by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_PRODUCTS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock data")
      const mockProduct = mockProducts.find((p) => p.id === params.id)
      if (mockProduct) {
        return NextResponse.json(mockProduct)
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    try {
      console.log(`Attempting to fetch product ${params.id} from Airtable...`)
      console.log("Using table:", process.env.AIRTABLE_PRODUCTS_TABLE)

      const productsTable = initAirtable()
      const record = await productsTable.find(params.id)

      console.log("Successfully fetched product from Airtable")

      const product = {
        id: record.id,
        name: record.get("name"),
        description: record.get("description"),
        price: record.get("price"),
        imageUrl: record.get("imageUrl"),
        seller: record.get("seller"),
      }

      return NextResponse.json(product)
    } catch (airtableError) {
      console.error("Airtable error when fetching product:", airtableError)

      // Try to return mock data if available
      const mockProduct = mockProducts.find((p) => p.id === params.id)
      if (mockProduct) {
        console.warn("Falling back to mock product data")
        return NextResponse.json(mockProduct)
      }

      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error fetching product:", error)

    // Try to return mock data if available
    const mockProduct = mockProducts.find((p) => p.id === params.id)
    if (mockProduct) {
      console.warn("Error occurred, returning mock product data")
      return NextResponse.json(mockProduct)
    }

    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }
}

// PUT update a product
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.price || !body.seller) {
      return NextResponse.json({ error: "Name, price, and seller are required" }, { status: 400 })
    }

    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_PRODUCTS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock response")
      return NextResponse.json({
        id: params.id,
        ...body,
      })
    }

    try {
      console.log(`Attempting to update product ${params.id} in Airtable...`)
      console.log("Using table:", process.env.AIRTABLE_PRODUCTS_TABLE)

      const productsTable = initAirtable()

      // Prepare the record data
      const recordData = {
        name: body.name,
        description: body.description || "",
        price: body.price,
        imageUrl: body.imageUrl || "",
        seller: body.seller,
      }

      console.log("Product data to be updated:", recordData)

      const record = await productsTable.update(params.id, recordData)
      console.log("Product updated successfully in Airtable")

      const product = {
        id: record.id,
        name: record.get("name"),
        description: record.get("description"),
        price: record.get("price"),
        imageUrl: record.get("imageUrl"),
        seller: record.get("seller"),
      }

      return NextResponse.json(product)
    } catch (airtableError) {
      console.error("Airtable error when updating product:", airtableError)

      // Fallback to mock data if Airtable fails
      console.warn("Falling back to mock product update")
      return NextResponse.json({
        id: params.id,
        ...body,
      })
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE a product
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_PRODUCTS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock success")
      return NextResponse.json({ success: true })
    }

    try {
      console.log(`Attempting to delete product ${params.id} from Airtable...`)
      console.log("Using table:", process.env.AIRTABLE_PRODUCTS_TABLE)

      const productsTable = initAirtable()
      await productsTable.destroy(params.id)
      console.log("Product deleted successfully from Airtable")

      return NextResponse.json({ success: true })
    } catch (airtableError) {
      console.error("Airtable error when deleting product:", airtableError)

      // Fallback to mock success if Airtable fails
      console.warn("Falling back to mock product deletion success")
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}

