import React, { useEffect } from "react";
import { useState } from "react";
import UserItem from "./UserItem";
import UserNewItem from "./UserNewItem";
import "./UserMenu.css";

const UserMenu = (props) => {
    const [addNewItem, setAddNewItem] = useState(false);
    const [from, setFrom] = useState(undefined);
    const [to, setTo] = useState(undefined);
    const [kaItem, setKaItem] = useState(false);
    const [kaItemShum, setKaItemShum] = useState(false);
    const [listaIndex, setListaIndex] = useState(0);
    const [lista, setLista] = useState([]);
    const [render, setRender] = useState(false);

    useEffect(() => {
        search();

    }, [render])

    const search = async() => {
        let userLocal = JSON.parse(localStorage.getItem("TTTUser"));
        let apicall = await fetch("http://localhost:3000/User/Items",{
            method: "post",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "uid": userLocal.uid,
                "from": from,
                "to": to
            })
        })
        let response = await apicall.json();
        if(response.success === true){
            if(response.lista.length >= 1){
                var listaFinal = [];
                while(response.lista.length >= 1){
                    listaFinal.push(response.lista.splice(0, 5));
                }
                if(listaFinal.length >= 2){
                    setKaItemShum(true);
                }else{
                    setKaItemShum(false);
                }
                setListaIndex(0);
                setLista([[{title: "Test",lastmod: "01/01/2020",howlong: "Just now"}]]);
                setLista(listaFinal);
                setKaItem(true);
            }else{
                setKaItem(false);
                setKaItemShum(false);
            }
        }else{
            setKaItem(false);
            setKaItemShum(false);
        }
    }

    const backnext = (bn) => {
        if(bn === "back"){
            if(listaIndex === 0){
                setListaIndex(lista.length - 1);
            }else{
                setListaIndex(listaIndex - 1);
            }
        }
        if(bn === "next"){
            if(listaIndex === lista.length - 1){
                setListaIndex(0);
            }else{
                setListaIndex(listaIndex + 1);
            }
        }
    }

    const logout = () => {
        localStorage.clear();
        props.history.push("/");
    }

    return(
        <div className="UserMenuBox">
            <h3 className="UserMenuLogout" onClick={() => logout()}>Logout</h3>
            <div className="UserMenuSearchBox">
                <h3 className="UserMenuFromText">From:</h3>
                <input className="UserMenuFrom" type="date" onChange={(e) => setFrom(e.target.value)} />
                <h3 className="UserMenuToText">To:</h3>
                <input className="UserMenuTo" type="date" onChange={(e) => setTo(e.target.value)} />
                <button className="UserMenuSearch" type="submit" onClick={() => search()}>Search</button>
                <button className="UserMenuNewButton" onClick={() => setAddNewItem(true)}>New</button>
            </div>
            <div className="UserMenuContentBox">
                {
                    addNewItem ?
                    <UserNewItem cancel={() => setAddNewItem(false)} render={() => setRender(!render)}/>
                    : null
                }
                {
                    kaItem ?
                    lista[listaIndex].map((item,i) =>{
                        return(
                        <UserItem key={i} itemData={item} search={() => search()} />
                        );
                      })
                      : <h5 className="NoSearchResult">No search result.</h5>
                }
                {
                    kaItemShum ?
                    <div className="UserMenuButtonsBox">
                        <button className="UserMenuBackNextButton" onClick={() => backnext("back")}>Back</button>
                        <button className="UserMenuBackNextButton" onClick={() => backnext("next")}>Next</button>
                    </div>
                    : null
                }
            </div>
        </div>
    );
}

export default UserMenu;