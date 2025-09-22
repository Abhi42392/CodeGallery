import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import "./globals.css";
import SignInOptions from "./components/SignInOptions";
import { auth } from "./auth";

export const metadata = {
  title: "Flexibble",
  description: "know what others are creating",
};

export default async function RootLayout({ children }) {
  const session=await auth();
  return (
    <html lang="en">
      <body>
        {session?
          <div className="min-h-screen flex flex-col">
            <NavBar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        :
        (<SignInOptions />)}
        
      </body>
    </html>
  );
}
