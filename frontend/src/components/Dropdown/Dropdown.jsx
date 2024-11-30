import { useState } from "react";
import './Dropdown.css';

export default function Dropdown(props){
    const [menuOpen, setMenuOpen] = useState(false);
    const [icoClass, setIcoClass] = useState('dd-ico material-symbols-rounded');
    
    const SELECT = {label: 'Select', id: -1};
    let initialSelectedItem = SELECT;
    if(props.initialVal){
        for(let item of props.items){
            if(item.id === props.initialVal){
                initialSelectedItem.id = item.id;
                initialSelectedItem.label = item.label;
            }
        }
    }
    const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

    function openMenu(){
        setMenuOpen(true);
        setIcoClass('dd-ico dd-ico-invert material-symbols-rounded');
    }

    function closeMenu(){
        setMenuOpen(false);
        setIcoClass('dd-ico material-symbols-rounded');
    }

    function toggleMenu(){
        menuOpen ? closeMenu() : openMenu();
    }

    function menuItemClickHandler(item){
        setSelectedItem(item);
        closeMenu();
        props.onValChange(item);
    }

    return (
        <div className="dropdown-root">
            <div className="dd-btn-root gen-input-root pointer flex-h flex-space-bw" onClick={() => toggleMenu()}>
                <div className="dd-btn-label">{selectedItem.label}</div>
                <div className={icoClass}>expand_more</div>
                
            </div>

            { menuOpen ? 
                <div className="dd-menu-root flex-v">
                    { props.items.map( (item) => <div key={item.id} className="dd-menu-item pointer" onClick={() => menuItemClickHandler(item)}>{item.label}</div>)}
                </div>
                : null
            }
        </div>
    );
}