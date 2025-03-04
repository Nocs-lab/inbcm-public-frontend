import React from "react"
import useStore from "../utils/store"
import Footer from "../components/Footer"
import Header from "../components/Header"
import { Navigate } from "react-router"
import { Link } from "react-router-dom"

const DefaultLayout: React.FC<{
  children: React.ReactNode
  returnLink?: boolean
}> = ({ children, returnLink = true }) => {
  const { user } = useStore()

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="container py-10">
          {returnLink && (
            <Link to={-1 as unknown as string} className="text-lg">
              <i className="fas fa-arrow-left" aria-hidden="true"></i>
              Voltar
            </Link>
          )}
          {children}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default DefaultLayout
