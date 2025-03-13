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

// GET all products
export async function GET(request: NextRequest) {
  try {
    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_PRODUCTS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock data")
      return NextResponse.json(mockProducts)
    }

    try {
      console.log("Attempting to fetch products from Airtable...")
      console.log("Using table:", process.env.AIRTABLE_PRODUCTS_TABLE)

      const productsTable = initAirtable()
      const records = await productsTable.select().all()

      console.log(`Successfully fetched ${records.length} products from Airtable`)

      const products = records.map((record) => ({
        id: record.id,
        name: record.get("name"),
        description: record.get("description"),
        price: record.get("price"),
        imageUrl: record.get("imageUrl"),
        seller: record.get("seller"),
      }))

      return NextResponse.json(products)
    } catch (airtableError) {
      console.error("Airtable error when fetching products:", airtableError)

      // Fallback to mock data if Airtable fails
      console.warn("Falling back to mock product data")
      return NextResponse.json(mockProducts)
    }
  } catch (error) {
    console.error("Error fetching products:", error)

    // Return mock data if there's an error
    console.warn("Error occurred, returning mock product data")
    return NextResponse.json(mockProducts)
  }
}

// POST create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.price || !body.seller) {
      return NextResponse.json({ error: "Name, price, and seller are required" }, { status: 400 })
    }

    // Check if Airtable credentials are available
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID || !process.env.AIRTABLE_PRODUCTS_TABLE) {
      console.warn("Airtable credentials or table name not found, returning mock response")
      return NextResponse.json(
        {
          id: `prod_${Date.now()}`,
          ...body,
        },
        { status: 201 },
      )
    }

    try {
      console.log("Attempting to create product in Airtable...")
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

      console.log("Product data to be created:", recordData)

      const record = await productsTable.create(recordData)
      console.log("Product created successfully in Airtable")

      const product = {
        id: record.id,
        name: record.get("name"),
        description: record.get("description"),
        price: record.get("price"),
        imageUrl: record.get("imageUrl"),
        seller: record.get("seller"),
      }

      return NextResponse.json(product, { status: 201 })
    } catch (airtableError) {
      console.error("Airtable error when creating product:", airtableError)

      // Fallback to mock data if Airtable fails
      console.warn("Falling back to mock product creation")
      return NextResponse.json(
        {
          id: `prod_${Date.now()}`,
          ...body,
        },
        { status: 201 },
      )
    }
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

