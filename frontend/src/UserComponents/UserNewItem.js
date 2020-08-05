import React, { useEffect } from "react";
import { useState } from "react";
import "./UserItem.css";

const UserNewItem = (props) => {
    const [title, setTitle] = useState("Type the title...");
    const [lastmod, setLastMod] = useState("");
    const [howlong, setHowLong] = useState("Just now");

    useEffect(() => {
        vendosDaten();

    }, [])

    const vendosDaten = () => {
        var data = new Date();
        var result;
        var month = data.getMonth() + 1;
        var day = data.getDate();
        var year = data.getFullYear();
        
        if(month < 10){
            month = "0" + month;
        }
        if(day < 10){
            day = "0" + day;
        }
        result = month + "/" + day + "/" + year;
        setLastMod(result);
    }

    const add = async () => {
        var access = 0;
        if(title !== "Type the title..." && title !== ""){
            access++;
        }

        if(access !== 0){
            let userLocal = JSON.parse(localStorage.getItem("TTTUser"));
            let apicall = await fetch("http://localhost:3000/User/AddItem",{
                method: "post",
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    "title": title,
                    "uid": userLocal.uid
                })
            })
            let response = await apicall.json();
            if(response.success === true){
                props.cancel();
                props.render();
            }
        }
    }

    return(
        <div className="UserItemBox">
            <div className="UserItemContentBox">
                <h3 onBlur={(e) => setTitle(e.currentTarget.textContent)} className="UserItemTitle" contentEditable="true" suppressContentEditableWarning={true}>{title}</h3>
                <p className="UserItemLastMod">Last Modified: {lastmod}</p>
                <p className="UserItemHowLong">{howlong}</p>
            </div>
            <div className="UserItemButtonBox">
                <div className="UserItemButtonImageBox" onClick={() => props.cancel()}>
                    <img className="UserItemButtonImage" src={require("../Images/Delete.png")} alt="Delete"/>
                </div>
                <div className="UserItemButtonImageBox" onClick={() => add()}>
                    <img className="UserItemButtonImage" src={require("../Images/Save.png")} alt="Add"/>
                </div>
            </div>
        </div>
    );
}

export default UserNewItem;