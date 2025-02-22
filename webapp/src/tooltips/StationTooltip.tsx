import { PickingInfo } from "deck.gl";
import React from 'react';
import '../styles/StationTooltip.css';

interface StationTooltipProps {
    info: PickingInfo;
}

const StationTooltip: React.FC<StationTooltipProps> = ({ info }) => {
    const isCluster = info.object.properties.cluster;
    const nbStations = 5;
    
    const renderTitle = () => {
        if (isCluster) {
            return `${info.object.properties.point_count} stations`;
        }
        return info.object.properties.name;
    };

    const renderStationList = () => {
        if (!isCluster) return null;

        const names = info.object.properties.name.slice(0, nbStations);
        const remainingCount = info.object.properties.name.length - nbStations;

        return (
            <div className="station-tooltip__station-list">
                {names.map((name: string, index: number) => (
                    <div key={index}>{name}</div>
                ))}
                {remainingCount > 0 && (
                    <div className="station-tooltip__remaining">
                        et {remainingCount} autres
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="station-tooltip">
            <h3 className="station-tooltip__title">
                {renderTitle()}
            </h3>
            {renderStationList()}
            <div className="station-tooltip__content">
                <div className="station-tooltip__row">
                    <span className="station-tooltip__label">Mécaniques</span>
                    <span className="station-tooltip__value">
                        {info.object.properties.mechanical}
                    </span>
                </div>
                <div className="station-tooltip__row">
                    <span className="station-tooltip__label">Électriques</span>
                    <span className="station-tooltip__value">
                        {info.object.properties.electric}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StationTooltip;