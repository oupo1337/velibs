import { PickingInfo } from "deck.gl";
import React from 'react';
import '../styles/DistrictTooltip.css';

interface BikeLanesTooltipProps {
    info: PickingInfo;
}

const BikeLanesTooltip: React.FC<BikeLanesTooltipProps> = ({ info }) => {
    const properties = info.object.properties;
    
    return (
        <div className="district-tooltip bike-lanes-tooltip">
            <h3 className="district-tooltip__title">
                {properties.name || 'Piste cyclable'}
            </h3>
            <div className="district-tooltip__content">
                <div className="district-tooltip__row">
                    <span className="district-tooltip__label">Aménagement</span>
                    <span className="district-tooltip__value">{properties.amenagement}</span>
                </div>
                <div className="district-tooltip__row">
                    <span className="district-tooltip__label">Surface</span>
                    <span className="district-tooltip__value">{properties.surface}</span>
                </div>
                <div className="district-tooltip__row">
                    <span className="district-tooltip__label">Sens</span>
                    <span className="district-tooltip__value">{properties.sens}</span>
                </div>
                {properties.vitesse_maximale_autorisee && (
                    <div className="district-tooltip__row">
                        <span className="district-tooltip__label">Vitesse max</span>
                        <span className="district-tooltip__value">{properties.vitesse_maximale_autorisee}</span>
                    </div>
                )}
                {(properties.coronapiste || properties.amenagement_temporaire) && (
                    <div className="district-tooltip__total-row">
                        <span className="district-tooltip__label">Type</span>
                        <span className="district-tooltip__value">
                            {properties.coronapiste ? 'Coronapiste' : 'Aménagement temporaire'}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BikeLanesTooltip;