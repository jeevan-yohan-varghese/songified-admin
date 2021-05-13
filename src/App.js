import React, { useEffect, useState } from 'react';
import './App.css'
import List from './components/List';
import withListLoading from './components/withListLoading';
import { initializeApp } from 'firebase/app';

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import google_logo from './images/google.svg';
require('dotenv').config()
process.env.CI = false

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGE_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};
const firebaseApp = initializeApp(firebaseConfig);


const provider = new GoogleAuthProvider();
const auth = getAuth();


function App() {
  const ListLoading = withListLoading(List);
  const [appState, setAppState] = useState({
    loading: true,
    comments: null,

  });
  const [authState, setAuthState] = useState({
    signedIn: false,
    userToken: null,

  });


  const loadComments = () => {
    
    const apiUrl = "http://songified-backend.herokuapp.com/songInfo";
    
    fetch(apiUrl, {
      method: 'get',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.userToken}`

      })
    })
      .then((res) => res.json())
      .then((data) => {
        setAppState({ loading: false, comments: data.infos });
      });
  };
  const signIn = () => {
    const signInUrl = "http://songified-backend.herokuapp.com/auth/login";
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = auth.currentUser.getIdToken().then((mToken) => {
          
          fetch(signInUrl, {
            method: 'post',
            headers: new Headers({
              'Content-Type': 'application/json',


            }

            ),
            body: JSON.stringify({ idToken: mToken }),
          }
          )
            .then((res) => res.json())
            .then((data) => {
              
              if (data.success) {
                
                const jwtToken = data.authToken
                setAuthState({ signedIn: true, userToken: jwtToken });
                localStorage.setItem('isSignedInLocal', "yes");
                localStorage.setItem('jwtTokenLocal', jwtToken);
                

              }

            });

        });






        // ...
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });

  }




  const verifyInfo = (comId) => {
    const verifyApiUrl = "http://songified-backend.herokuapp.com/songInfo/authenticate";
    
    //setAppState({ loading: true });
    const reqOptions = {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.userToken}`,

      }

      ),
      body: JSON.stringify({ id: comId })
    };



    fetch(verifyApiUrl, reqOptions)
      .then((res) => res.json())
      .then((data) => {
        

        loadComments();


      });
  };
  const logout = () => {

    localStorage.setItem('isSignedInLocal', "no");
    localStorage.setItem('jwtTokenLocal', null);
    setAuthState({ signedIn: false, userToken: null });

  };
  const unVerifyInfo = (id) => {
    const unverifyApiUrl = "http://songified-backend.herokuapp.com/songInfo/deauthenticate";
    setAppState({ loading: true });
    fetch(unverifyApiUrl, {
      method: 'post',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authState.userToken}`

      }

      ),
      body: JSON.stringify({ id: id }),
    }
    )
      .then((res) => res.json())
      .then((data) => {
        loadComments();
      });
  };


  useEffect(() => {
    const localSignedIn = localStorage.getItem('isSignedInLocal');
    const localJwt = localStorage.getItem('jwtTokenLocal');

    if (localSignedIn==="yes") {

      setAuthState({ signedIn: true, userToken: localJwt });
    }




  }, []);

  useEffect(() => {

    if (authState.signedIn && appState.loading) {
      loadComments();
    }



  }, [authState]);

  return (
    <div className='main_div'>

      <div class="appbar"><p>Songified Admin</p>

        {authState.signedIn ?
          <button className="btn logout_btn" onClick={() =>logout()}>LOGOUT</button> : ""
        }
      </div>


      <div className='content_div'>

        {authState.signedIn ?

          <ListLoading isLoading={appState.loading} comments={appState.comments} verifyFunc={(id) => verifyInfo(id)} unVerifyFunc={(id) => unVerifyInfo(id)} />
          : <div className="sign_in_div"><div class="sign_in_btn_container"><img src={google_logo} width="20px" height="20px" /><button className="signInBtn" onClick={() => signIn()}>Sign In</button></div></div>
        }
      </div>
    </div>
  );
}
export default App;