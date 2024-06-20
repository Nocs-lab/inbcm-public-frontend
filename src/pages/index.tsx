import DefaultLayout from "../layouts/default"
import useStore from "../utils/store"

const IndexPage = () => {
  const user = useStore((state) => state.user)

  return (
    <DefaultLayout>
      <h2>Olá {user?.name.split(" ")[0]}!</h2>
    </DefaultLayout>
  )
}

export default IndexPage
