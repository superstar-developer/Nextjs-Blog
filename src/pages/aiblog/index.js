import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"
import AiBlog from "@/aiblog/AiBlog"

const aiBlog = () => {
    return (
        <>
            <Navbar isBlogPage={true} />

            <main>
                <AiBlog />
            </main>

            <Footer />
        </>
    )
}

export default aiBlog