import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
   <main className="h-screen w-screen">
    <div className="w-full h-screen flex">
      <div className="w-1/3 bg-red-500">
a
      </div>
      <div className="w-2/3 bg-blue-500">b</div>
    </div>
   </main>
  );
}
