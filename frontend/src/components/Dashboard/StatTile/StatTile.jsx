import './StatTile.css'

export default function StatTile({title, ico, icoColourClass, count}){
    return (
        <div className="stat-tile-root flex-h flex-align-center">
            <div className={'stat-ico material-symbols-rounded ' + icoColourClass}>{ico}</div>
            <div className="stat-details">
                <div className="stat-title">{title}</div>
                <div className="stat-count">{count}</div>
            </div>
        </div>
    );
}