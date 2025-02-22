import React from 'react';

import { PickingInfo } from "deck.gl";

import '../styles/DistrictTooltip.css';

interface DistrictTooltipProps {
    info: PickingInfo;
}

const DistrictTooltip: React.FC<DistrictTooltipProps> = ({ info }) => {
    const total = info.object.properties.mechanical + info.object.properties.electric;
    
    return (
        <div className="district-tooltip">
            <h3 className="district-tooltip__title">
                {info.object.properties.name}
            </h3>
            <div className="district-tooltip__content">
                <div className="district-tooltip__row">
                    <span className="district-tooltip__label">Mécaniques</span>
                    <span className="district-tooltip__value">{info.object.properties.mechanical}</span>
                </div>
                <div className="district-tooltip__row">
                    <span className="district-tooltip__label">Électriques</span>
                    <span className="district-tooltip__value">{info.object.properties.electric}</span>
                </div>
                <div className="district-tooltip__total-row">
                    <span className="district-tooltip__label">Total</span>
                    <span className="district-tooltip__value">{total}</span>
                </div>
            </div>
        </div>
    );
};

export default DistrictTooltip;