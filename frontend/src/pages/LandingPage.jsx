import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaArrowsAlt } from "react-icons/fa";
import { FiZap, FiMenu } from "react-icons/fi";
import { IoSparkles } from "react-icons/io5";
import { FaLinkedin,FaGithub } from "react-icons/fa";

const LandingPage = () => {
  const [projectGoal, setProjectGoal] = useState("");
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = {
    darkBg: "bg-[#2E3944]",
    darkestShade: "bg-[#212A31]",
    primaryAccent: "bg-[#124E66]",
    secondaryBorders: "border-[#748D92]",
    lightContentBg: "bg-[#D3D9D4]",
    primaryText: "text-white",
    darkText: "text-[#212A31]",
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const handleGeneratePlan = async () => {
    if (!projectGoal) {
      setError("Please enter a project goal first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);

    const prompt = `Based on the project goal "${projectGoal}", generate a simple project plan. The plan should include three lists: "To Do", "In Progress", and "Done". The "To Do" list should have 4-5 tasks. The "In Progress" list should have 1-2 tasks, and the "Done" list should have 1 task representing the project's start. Please provide the output in a structured JSON format.`;

    const schema = {
        type: "OBJECT",
        properties: {
            lists: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        cards: {
                            type: "ARRAY",
                            items: { type: "STRING" }
                        }
                    },
                    required: ["title", "cards"]
                }
            }
        },
        required: ["lists"]
    };

    try{
        const apiKey="";
        const apiUrl=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload={
            contents:[{parts:[{text:prompt}]}],
            generationConfig:{
                responseMimeType:"application/json",
                responseSchema:schema
            }
        };

        const response=await fetch(apiUrl,{
            method:"POST",
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(payload)
        });

        if(!response.ok) throw new Error (`API error: ${response.statusText}`);

        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]) {
            const plan = JSON.parse(result.candidates[0].content.parts[0].text);
            setGeneratedPlan(plan);
        } else {
            throw new Error("Unexpected API response structure.");
        }
    }catch(err){
        console.error("Error generating plan:", err);
        setError("Sorry, we couldn't generate a plan at this time.");
    }finally{
         setIsLoading(false);
    }

  };
   return (
    <>
      <motion.header 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className="p-4 md:px-8 sticky top-0 z-50 bg-[#2E3944]/80 backdrop-blur-sm"
      >
        <nav className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold">Swiftly</div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="http://localhost:5001/auth/google" className="hover:text-gray-300 transition-colors">Sign In</a>
            <motion.a 
              href="http://localhost:5001/auth/google" 
              className={`${styles.primaryAccent} px-6 py-2 rounded-3xl font-semibold`}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.a>
          </div>
          <div className="md:hidden">
            <button className="focus:outline-none"><FiMenu className="w-6 h-6" /></button>
          </div>
        </nav>
      </motion.header>

      <main>
        <section className="text-center container mx-auto py-20 md:py-32 px-4">
          <motion.h1 
            variants={fadeIn} initial="hidden" animate="visible"
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Organize Your Tasks, Seamlessly.
          </motion.h1>
          <motion.p 
             variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }}
             className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-gray-300"
          >
            Transform chaos into clarity with our visual task management platform. Organize tasks, boost collaboration, and deliver results faster than ever.
          </motion.p>
          <motion.div
            variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.4 }}
            className="mt-10"
          >
            <motion.a 
              href="http://localhost:5001/auth/google" 
              className={`${styles.primaryAccent} text-lg font-semibold px-10 py-4 rounded-4xl shadow-lg inline-block`}
              whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }}
            >
              Get Started - It's Free
            </motion.a>
          </motion.div>
        </section>

        <motion.section 
          id="features" className="py-20 px-4"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="container mx-auto">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <motion.div variants={fadeIn} className="flex flex-col items-center">
                <div className={`p-4 rounded-full ${styles.primaryAccent} mb-4 text-2xl`}><FiZap /></div>
                <h3 className="text-xl font-bold mb-2">Real-time Collaboration</h3>
                <p className="text-gray-300 max-w-xs">See changes instantly. When a teammate moves a card, you'll see it happen live.</p>
              </motion.div>
              <motion.div variants={fadeIn} className="flex flex-col items-center">
                 <div className={`p-4 rounded-full ${styles.primaryAccent} mb-4 text-2xl`}><FaArrowsAlt /></div>
                <h3 className="text-xl font-bold mb-2">Intuitive Drag & Drop</h3>
                <p className="text-gray-300 max-w-xs">Easily organize your workflow by dragging tasks between lists. It's that simple.</p>
              </motion.div>
              <motion.div variants={fadeIn} className="flex flex-col items-center">
                 <div className={`p-4 rounded-full ${styles.primaryAccent} mb-4 text-2xl`}><FaUsers /></div>
                <h3 className="text-xl font-bold mb-2">Built for Teams</h3>
                <p className="text-gray-300 max-w-xs">Share boards with your team, assign tasks, and keep everyone on the same page.</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section 
          id="gemini-demo" className="py-20 px-4 bg-[#212A31]/50"
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
            <div className="container mx-auto text-center">
                <div className="flex justify-center items-center gap-2">
                   <IoSparkles className="text-2xl" />
                   <h2 className="text-3xl md:text-4xl font-bold">AI Project Kick-starter</h2>
                </div>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto mb-8">
                    Don't know where to start? Describe your project goal and let our AI generate a starting plan for you.
                </p>
                <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                    <input
                        type="text" value={projectGoal} onChange={(e) => setProjectGoal(e.target.value)}
                        placeholder="e.g., Launch a new marketing campaign for Q4"
                        className={`w-full p-4 rounded-4xl ${styles.darkText} bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#124E66]`}
                    />
                    <motion.button
                        onClick={handleGeneratePlan} disabled={isLoading}
                        className={`${styles.primaryAccent} text-lg font-semibold px-8 py-4 rounded-4xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-2`}
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    >
                        {isLoading ? 'Generating...' : <><IoSparkles /> Generate Plan</>}
                    </motion.button>
                </div>
                {error && <p className="text-red-400 mt-4">{error}</p>}
                {generatedPlan && (
                    <motion.div 
                      className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
                      variants={staggerContainer} initial="hidden" animate="visible"
                    >
                        {generatedPlan.lists.map((list) => (
                            <motion.div key={list.title} variants={fadeIn} className={`${styles.lightContentBg} ${styles.darkText} p-4 rounded-lg`}>
                                <h3 className="font-bold text-xl mb-4">{list.title}</h3>
                                <motion.div variants={staggerContainer} className="space-y-3">
                                    {list.cards.map((card) => (
                                        <motion.div key={card} variants={fadeIn} className="bg-white p-3 rounded-xl shadow">
                                            {card}
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </motion.section>
      </main>

     <footer className={`text-center py-8 text-gray-400 border-t ${styles.secondaryBorders}`}>
  <div className="container mx-auto flex justify-between items-center">
    <div className="w-full text-center">
      <p>&copy; {new Date().getFullYear()} Swiftly. All rights reserved.</p>
    </div>
    <div className="absolute right-8 flex space-x-4 text-right">
      <a href="https://www.linkedin.com" target="_blank"><FaLinkedin/></a>
      <a href="https://github.com/amman-k" target="_blank"><FaGithub/></a>
    </div>
  </div>
</footer>
    </>
  );
};

export default LandingPage;
