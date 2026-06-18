"use client";

import Image from "next/image";
import { motion } from "framer-motion";

// Import local assets
import work1 from "@/assets/images/recent-work-1.jpg";
import work2 from "@/assets/images/recent-work-2.jpg";
import work3 from "@/assets/images/recent-work-3.jpg";
import work4 from "@/assets/images/recent-work-4.jpg";
import work5 from "@/assets/images/recent-work-5.jpg";
import work6 from "@/assets/images/recent-work-6.jpg";

const RecentWorks = () => {
  const topRowItems = [
    { id: 1, src: work1, alt: "Canvas lake print mockup" },
    { id: 2, src: work2, alt: "Annual report geometric poster" },
    { id: 3, src: work3, alt: "Custom print canvas bags" },
    { id: 4, src: work4, alt: "Rucksack booklet mockup" },
  ];

  const bottomRowItems = [
    { id: 5, src: work5, alt: "DeSign lightbulb print workspace" },
    { id: 6, src: work6, alt: "Four customized ceramic mugs" },
  ];

  return (
    <section className="relative w-full bg-[#FFFFFF] py-16 md:py-24 overflow-hidden">
      {/* Header Container */}
      <div className="container mx-auto px-6 text-center mb-12 md:mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-teal-500 font-bold text-xs md:text-sm tracking-widest uppercase block mb-3">
            OUR RECENT WORKS
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-1 md:gap-2"
        >
          <h2 className="text-[#031E39] text-[32px] sm:text-[40px] md:text-[48px] lg:text-[55px] font-semibold tracking-tight leading-tight">
            Let's See Our Latest Project
          </h2>
          <h2 className="text-[#031E39] text-[32px] sm:text-[40px] md:text-[48px] lg:text-[55px] font-semibold tracking-tight leading-tight">
            Make Us Pride
          </h2>
        </motion.div>
      </div>

      {/* Grid Container */}
      <div className="container mx-auto px-6 md:px-12 lg:px-20 max-w-7xl">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Row 1 - 4 Columns */}
          {topRowItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.8,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="col-span-12 sm:col-span-6 lg:col-span-3 aspect-square relative rounded-[24px] overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                quality={95}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          ))}

          {/* Row 2 - 2 Columns */}
          {bottomRowItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.8,
                delay: 0.4 + idx * 0.15,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="col-span-12 lg:col-span-6 aspect-[1.5/1] sm:aspect-[2/1.1] relative rounded-[32px] overflow-hidden border border-gray-100 group shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                quality={95}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default RecentWorks;
