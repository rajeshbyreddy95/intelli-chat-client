import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Chat from './Pages/Chat'
import PdfSummariser from './Pages/PdfSummariser'

const router = createBrowserRouter([
  { path: "/", element: <Chat /> },
  { path: "/pdf-summarizer", element: <PdfSummariser /> }
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
