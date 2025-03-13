// API client functions for interacting with the backend

// Product types
interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  seller: string
}

interface ProductInput {
  name: string
  description: string
  price: number
  imageUrl: string
  seller: string
}

// Order types
interface Order {
  id: string
  productId: string
  productName: string
  buyerName: string
  buyerEmail: string
  shippingAddress: string
  quantity: number
  totalPrice: number
  status: string
  createdAt?: string
}

interface OrderInput {
  productId: string
  productName: string
  buyerName: string
  buyerEmail: string
  shippingAddress: string
  quantity: number
  totalPrice: number
  status: string
}

// API base URL
const API_URL = "/api"

// Mock data for development (will be used if API calls fail)
const MOCK_PRODUCTS: Product[] = [
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

const MOCK_ORDERS: Order[] = [
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
]

// Product API functions
export async function getProducts(): Promise<Product[]> {
  try {
    console.log("Making API request to fetch products...")
    const response = await fetch(`${API_URL}/products`)

    if (!response.ok) {
      console.warn("API request failed with status:", response.status)
      console.warn("Using mock product data instead")
      return MOCK_PRODUCTS
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data.length} products from API`)
    return data
  } catch (error) {
    console.error("Error fetching products:", error)
    console.warn("Using mock product data due to API error")
    return MOCK_PRODUCTS
  }
}

export async function getProduct(id: string): Promise<Product> {
  try {
    console.log(`Making API request to fetch product ${id}...`)
    const response = await fetch(`${API_URL}/products/${id}`)

    if (!response.ok) {
      console.warn("API request failed with status:", response.status)
      console.warn("Using mock product data instead")
      const mockProduct = MOCK_PRODUCTS.find((p) => p.id === id)
      if (mockProduct) return mockProduct
      throw new Error("Product not found")
    }

    const data = await response.json()
    console.log("Successfully fetched product from API")
    return data
  } catch (error) {
    console.error("Error fetching product:", error)
    const mockProduct = MOCK_PRODUCTS.find((p) => p.id === id)
    if (mockProduct) {
      console.warn("Using mock product data due to API error")
      return mockProduct
    }
    throw new Error("Product not found")
  }
}

export async function createProduct(product: ProductInput): Promise<Product> {
  try {
    console.log("Making API request to create product...")
    const response = await fetch(`${API_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("Server returned error:", responseData)
      throw new Error(responseData.error || "Failed to create product")
    }

    console.log("Product created successfully:", responseData)
    return responseData
  } catch (error) {
    console.error("Error creating product:", error)
    // For development, return a mock created product
    const mockProduct = {
      id: `prod_${Date.now()}`,
      ...product,
    }
    console.log("Using mock product due to API error:", mockProduct)
    return mockProduct
  }
}

export async function updateProduct(id: string, product: ProductInput): Promise<Product> {
  try {
    console.log(`Making API request to update product ${id}...`)
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("Server returned error:", responseData)
      throw new Error(responseData.error || "Failed to update product")
    }

    console.log("Product updated successfully:", responseData)
    return responseData
  } catch (error) {
    console.error("Error updating product:", error)
    // For development, return the updated product
    const mockProduct = {
      id,
      ...product,
    }
    console.log("Using mock product due to API error:", mockProduct)
    return mockProduct
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    console.log(`Making API request to delete product ${id}...`)
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const responseData = await response.json()
      console.error("Server returned error:", responseData)
      throw new Error(responseData.error || "Failed to delete product")
    }

    console.log("Product deleted successfully")
  } catch (error) {
    console.error("Error deleting product:", error)
    // For development, just log the error
    console.log("Simulating successful deletion despite API error")
  }
}

// Order API functions
export async function getOrders(): Promise<Order[]> {
  try {
    console.log("Making API request to fetch orders...")
    const response = await fetch(`${API_URL}/orders`)

    if (!response.ok) {
      console.warn("API request failed with status:", response.status)
      console.warn("Using mock order data instead")
      return MOCK_ORDERS
    }

    const data = await response.json()
    console.log(`Successfully fetched ${data.length} orders from API`)
    return data
  } catch (error) {
    console.error("Error fetching orders:", error)
    console.warn("Using mock order data due to API error")
    return MOCK_ORDERS
  }
}

export async function getOrder(id: string): Promise<Order> {
  try {
    console.log(`Making API request to fetch order ${id}...`)
    const response = await fetch(`${API_URL}/orders/${id}`)

    if (!response.ok) {
      console.warn("API request failed with status:", response.status)
      console.warn("Using mock order data instead")
      const mockOrder = MOCK_ORDERS.find((o) => o.id === id)
      if (mockOrder) return mockOrder
      throw new Error("Order not found")
    }

    const data = await response.json()
    console.log("Successfully fetched order from API")
    return data
  } catch (error) {
    console.error("Error fetching order:", error)
    const mockOrder = MOCK_ORDERS.find((o) => o.id === id)
    if (mockOrder) {
      console.warn("Using mock order data due to API error")
      return mockOrder
    }
    throw new Error("Order not found")
  }
}

export async function createOrder(order: OrderInput): Promise<Order> {
  try {
    console.log("Making API request to create order:", order)
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("Server returned error:", responseData)
      throw new Error(responseData.error || "Failed to create order")
    }

    console.log("Order created successfully:", responseData)
    return responseData
  } catch (error) {
    console.error("Error creating order:", error)
    // For development, return a mock created order
    const mockOrder = {
      id: `order_${Date.now()}`,
      ...order,
      createdAt: new Date().toISOString(),
    }
    console.log("Using mock order due to API error:", mockOrder)
    return mockOrder
  }
}

export async function updateOrder(id: string, order: Partial<OrderInput>): Promise<Order> {
  try {
    console.log(`Making API request to update order ${id}...`)
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("Server returned error:", responseData)
      throw new Error(responseData.error || "Failed to update order")
    }

    console.log("Order updated successfully:", responseData)
    return responseData
  } catch (error) {
    console.error("Error updating order:", error)
    // For development, return a mock updated order
    const mockOrder = MOCK_ORDERS.find((o) => o.id === id)
    if (mockOrder) {
      const updatedOrder = {
        ...mockOrder,
        ...order,
      }
      console.log("Using mock order due to API error:", updatedOrder)
      return updatedOrder
    }
    throw new Error("Order not found")
  }
}

