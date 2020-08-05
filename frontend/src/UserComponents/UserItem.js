import React, { useEffect } from "react";
import { useState } from "react";
import "./UserItem.css";

const UserItem = (props) => {
    const [titleEditable, setTitleEditable] = useState(false);
    const [editsaveButton, setEditSaveButton] = useState(require("../Images/Edit.png"));
    const [title, setTitle] = useState(props.itemData.title);
    const [lastmod, setLastMod] = useState(props.itemData.lastmod);
    const [howlong, setHowLong] = useState(props.itemData.howlong);

    useEffect(() => {
        setTitle(props.itemData.title);
        setLastMod(props.itemData.lastmod);
        setHowLong(props.itemData.howlong);
    }, [props.itemData.itemID])

    const edit = async () => {
        var temp = null;
        setTitleEditable(!titleEditable);
        temp = !titleEditable;
        if(temp === true){
            setEditSaveButton(require("../Images/Save.png"));
        }
        if(temp === false){
            let userLocal = JSON.parse(localStorage.getItem("TTTUser"));
            let apicall = await fetch("http://localhost:3000/User/EditItem",{
                method: "post",
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    "uid": userLocal.uid,
                    "itemID": props.itemData.itemID,
                    "title": title
                })
            })
            let response = await apicall.json();
            if(response.success === true){
                setEditSaveButton(require("../Images/Edit.png"));
            }
        }
    }

    const deletee = async () => {
        let userLocal = JSON.parse(localStorage.getItem("TTTUser"));
        let apicall = await fetch("http://localhost:3000/User/DeleteItem",{
            method: "post",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "uid": userLocal.uid,
                "itemID": props.itemData.itemID
            })
        })
        let response = await apicall.json();
        if(response.success === true){
            props.search();
        }
    }

    return(
        <div className="UserItemBox">
            <div className="UserItemContentBox">
                <h3 onBlur={(e) => setTitle(e.currentTarget.textContent)} className="UserItemTitle" contentEditable={titleEditable} suppressContentEditableWarning={true}>{title}</h3>
                <p className="UserItemLastMod">Last Modified: {lastmod}</p>
                <p className="UserItemHowLong">{howlong}</p>
            </div>
            <div className="UserItemButtonBox">
                <div className="UserItemButtonImageBox" onClick={() => deletee()}>
                    <img className="UserItemButtonImage" src={require("../Images/Delete.png")} alt="Delete"/>
                </div>
                <div className="UserItemButtonImageBox" onClick={() => edit()}>
                    <img className="UserItemButtonImage" src={editsaveButton} alt="Edit"/>
                </div>
            </div>
        </div>
    );
}

export default UserItem;