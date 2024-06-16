import { useState } from "react";
import { Fahkwang, Inter } from "next/font/google";
import Editor from "@monaco-editor/react";
import OpenAI from "openai";
import { deployContract } from './api/deploy'; 

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
 // initiate openai client
 const openai = new OpenAI({
  organization: process.env.NEXT_PUBLIC_ORG_ID,
  project: process.env.NEXT_PUBLIC_PROJECT_ID,
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
 });

 // default code to be displayed in the editor
 const defaultCode = `
 #![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
  pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
    vec![&env, symbol_short!("Hello"), to]
  }
}`;

 const [isCompiling, setIsCompiling] = useState(false);
 const [isCompiled, setIsCompiled] = useState(false);
 const [isDeploying, setIsDeploying] = useState(false);
 const [isGenerating, setIsGenerating] = useState(false);
 const [userPrompt, setUserPrompt] = useState('');
 const [code, setCode] = useState('')
 const [compiledOutput, setCompiledOutput] = useState("");
 const [compilationError, setCompilationError] = useState(null);
 const [banner, setBanner] = useState(true);

 const handleCodeChange = (newCode) => {
  setCode(newCode);
 };

 const handleInputChange = (e) => {
  const { name, value } = e.target;
  setUserPrompt(value); // Update directly with the value
 };

 const clearOutput = () => {
  setCompiledOutput("");
  setCompilationError(null);
 };

 const handleCompile = async () => {
  clearOutput();
  setIsCompiling(true);
  try {
   const response = await fetch("/api/compile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
   });
  
   if (!response.ok) {
    throw new Error("Compilation failed");
    setCompilationError("Compilation failed");
   }
  
   const compiledBytecode = await response.json();
  
   // Update compiled output state
   setCompiledOutput(compiledBytecode);
  
   console.log("Compiled bytecode:", compiledBytecode);
  } catch (error) {
   console.error(error);
  }
  finally{
   setIsCompiling(false);
   setIsCompiled(true);
  }
 };

 const handleDeploy = async () => {
  clearOutput();
  setDeploying(true);
  try {
   const response = await deployContract(compiledWasm); // Assuming compiled Wasm is available
   console.log("Deployment response:", response);
  } catch (error) {
   console.error("Deployment error:", error);
  } finally {
   setDeploying(false);
  }
 };

 // generate rust code based on the prompt
 const generateCode = async () => {
  setIsGenerating(true);
  console.log("user prompt", userPrompt);
  
  try {
   const completion = await openai.chat.completions.create({
    messages: [
     {
      role: "system",
      content: "You are a soroban smart contract developer and your job is to generate the suroban smart contract code for the following request.",
     },
     {
      role: "user",
      content: `${userPrompt}. the output should be a json object with key as code.`,
     },
    ],
    model: "gpt-4o",
    response_format: { type: "json_object" },
   });
  
   const generatedCode = JSON.parse(completion.choices[0].message.content);
   handleCodeChange(generatedCode.code);
   setCompiledOutput(generatedCode.code);
   console.log("generated code", generatedCode);
  } catch (error) {
   console.error("Error generating code:", error);
  } finally {
   setIsGenerating(false);
  }
 };

 return (
  <main className="bg-black h-screen w-screen">
   {
    banner && (
     <div className="bg-white w-screen text-black text-sm p-8 absolute top-0 z-20 flex space-x-8" onClick={()=>setBanner(false)}> 
    <button>[ close ]</button>
    <div>the platform is under development and most of the features are unstable. contact <a href="https://twitter.com/mayursamr" className="underline" target="_blank">mayursamr</a> for more details.</div>
   </div>
    )
   }
    
   <div className="w-full h-full flex">
    <div className="w-2/3 p-4 bg-black flex flex-col">
     <Editor
      height="90vh"
      defaultLanguage="rust"
      theme="vs-dark"
      defaultValue={defaultCode}
      value={code}
      onChange={handleCodeChange}
     />
     <div className="flex p-4 space-x-4">
      <button
       onClick={handleCompile}
       type="button"
       className="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center"
      >
       {isCompiling ? (
        <>
         <svg
          aria-hidden="true"
          role="status"
          className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
         >
          <path
           d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
           fill="currentColor"
          />
          <path
           d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
           fill="#1C64F2"
          />
         </svg>{" "}
         compiling...
        </>
       ) : (
        "compile contract"
       )}
      </button>
      <button
       disabled={!isCompiled}
       onClick={handleDeploy}
       type="button"
       className="py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center disabled:cursor-not-allowed"
      >
       {isDeploying ? (
        <>
         <svg
          aria-hidden="true"
          role="status"
          className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
         >
          <path
           d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
           fill="currentColor"
          />
          <path
           d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
           fill="#1C64F2"
          />
         </svg>{" "}
         deploying...
        </>
       ) : (
        "deploy contract"
       )}
      </button>
     </div>
    </div>
    <div className="w-1/3 h-screen bg-black flex flex-col">
     
      <div className="text-center text-white my-4 text-xl">
       phoenix ide
      </div>
      <div className="flex flex-col h-full space-y-4">
        <div className="text-white">output</div>
       <div className="p-4 bg-neutral-800 text-white h-1/3 overflow-auto">
       

{
 compilationError && (<div className="text-sm">{compilationError}</div>)
}

       {compiledOutput && (
  <pre className="text-left text-sm text-slate-400">{compiledOutput}</pre>
 )}
       </div>
       <div className="text-white">phoenix ai</div>
       <div className="p-4 bg-neutral-800 text-white h-auto flex flex-col">
        
        <textarea
         className="bg-neutral-800 text-slate-400 border-none focus:outline-none"
         rows={4}
         name="userPrompt"
         value={userPrompt}
         onInput={handleInputChange}
         placeholder="write the contract to send amount from account a to account b"
        />
       </div>
       <div className="">
       <button
        onClick={generateCode}
        type="button"
        className="mt-4 py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:outline-none focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center disabled:cursor-not-allowed"
       >
        {isGenerating ? (
         <>
          <svg
           aria-hidden="true"
           role="status"
           className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600"
           viewBox="0 0 100 101"
           fill="none"
           xmlns="http://www.w3.org/2000/svg"
          >
           <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
           />
           <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="#1C64F2"
           />
          </svg>{" "}
          generating...
         </>
        ) : (
         "generate code"
        )}
       </button>
      
      </div>
      <div className="w"></div>
       </div>

       
     {/* <div className="h-full bg-white">a</div> */}
    </div>
   </div>
  </main>
 );
}
