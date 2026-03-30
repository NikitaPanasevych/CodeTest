import { CELL_TYPES } from '../constants/cellTypes';

const TILE_SIZE = 36;

const TILE_IMAGES = {
  [CELL_TYPES.CABANA]: '/assets/cabana.png',
  [CELL_TYPES.POOL]:   '/assets/pool.png',
  [CELL_TYPES.HOUSE]:  '/assets/houseChimney.png',
  [CELL_TYPES.PATH]:   '/assets/arrowStraight.png',
};

export default function MapTile({ cell, pathConfig, onClick }) {
  const { type, available } = cell;

  const size = { width: TILE_SIZE, height: TILE_SIZE };

  if (type === CELL_TYPES.EMPTY) {
    return <div className="flex-shrink-0" style={size} />;
  }

  const isCabana = type === CELL_TYPES.CABANA;
  const overlayColor = available ? 'bg-green-500/40' : 'bg-red-500/50';

  const imgSrc = pathConfig ? pathConfig.src : TILE_IMAGES[type];
  const imgStyle = pathConfig?.rotation
    ? { transform: `rotate(${pathConfig.rotation}deg)` }
    : undefined;

  return (
    <div
      className={[
        'relative flex-shrink-0 box-border',
        isCabana
          ? 'cursor-pointer transition-all duration-150 hover:brightness-110 hover:z-10 hover:shadow-[0_0_0_2px_rgba(212,168,67,0.7)]'
          : 'cursor-default',
      ].join(' ')}
      style={size}
      onClick={isCabana ? onClick : undefined}
      title={isCabana ? (available ? 'Available' : 'Booked') : undefined}
    >
      <img
        src={imgSrc}
        alt={type}
        className="w-full h-full object-cover block"
        style={imgStyle}
        draggable={false}
      />
      {isCabana && (
        <div className={`absolute inset-0 ${overlayColor} transition-colors duration-300`} />
      )}
    </div>
  );
}
