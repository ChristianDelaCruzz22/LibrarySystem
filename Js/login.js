import { auth, db } from "./config.js";
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPass").value;

    
    if (!email.endsWith("@neu.edu.ph")) {
        alert("Access Denied: Please use your official @neu.edu.ph institutional email.");
        return;
    }

    try {
      
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

       
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
            const userData = userDoc.data();
            
           
            if (userData.role !== "Admin") {
                const q = query(collection(db, "blockedUsers"), where("studentID", "==", userData.studentID));
                const blockSnap = await getDocs(q);

                if (!blockSnap.empty) {
                    await signOut(auth); 
                    alert("ACCESS DENIED: Your account is restricted by the library admin.");
                    return; 
                }
            }

           
            if (userData.role === "Admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "visitor.html";
            }
        } else {
            alert("User data not found in database.");
        }
    } catch (error) {
    
        if (error.code === 'auth/invalid-credential') {
            alert("Invalid email or password.");
        } else {
            alert("Login failed: " + error.message);
        }
    }
});
