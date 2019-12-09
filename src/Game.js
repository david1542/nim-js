import React, {useCallback, useEffect, useState} from 'react';
import classnames from 'classnames';
import {calculateNimSum, getWinningGroupIndex } from "./utils";

const FORMATION = {
  arrays: [{
    size: 3
  }, {
    size: 4
  }, {
    size: 5
  }]
};

const generateFormation = (settings) => {
  return settings.arrays.map((options, groupIndex) => {
    const result = [];
    for (let i = 0; i < options.size; i++) {
      result.push({
        groupIndex,
        itemIndex: i
      });
    }

    return result;
  });
};

const blockStyle = {
  width: 50,
  height: 50,
  margin: '0 5px',
  transition: '0.2s'
};

const isItemMatch = (item1, item2) => {
  return item1.itemIndex === item2.itemIndex
    && item1.groupIndex === item2.groupIndex;
};

const isFormationEmpty = (formation) => {
  return formation.every(group => !group.length);
};

const PLAYER_TYPES = {
  COMPUTER: 'computer',
  USER: 'user'
};

const PLAYERS = [{
  name: 'David',
  type: PLAYER_TYPES.USER
}, {
  name: 'Computer',
  type: PLAYER_TYPES.COMPUTER
}];

const isPlayerComputer = (player) => {
  return player.type === PLAYER_TYPES.COMPUTER;
};

const Information = ({ player }) => {
  return (
    <div className="d-flex flex-column">
      <p className="mb-1">Choose your blocks and press "Play"</p>
      <p className="mt-0 mb-3">
        <span className="font-weight-bold">Current Player Turn:&nbsp;</span>
        {player.name}
      </p>
    </div>
  )
};

const Formation = (props) => {
  const { formation, selectedItems, selectItem } = props;
  return (
    <div className="d-flex justify-content-center align-items-center flex-wrap">
      {formation.map((group, groupIndex) => {
        return (
          <div key={groupIndex} style={{ display: 'flex', margin: 20 }}>
            {group.length ? group.map((item, index) => {
              const isItemSelected = selectedItems.some(selectedItem => {
                return isItemMatch(item, selectedItem);
              });
              return (
                <div
                  key={index}
                  className={classnames('rounded', {
                    'bg-danger': !isItemSelected,
                    'bg-success': isItemSelected
                  })}
                  style={blockStyle}
                  onClick={() => selectItem(item)}
                />
              );
            }) : <h4>Empty</h4>}
          </div>
        )
      })}
    </div>
  );
};

const Winner = ({ player }) => {
  return (
    <div className="d-flex w-100 h-100 align-items-center justify-content-center">
      <h2 style={{ marginTop: -125 }}>
        The winner is <span className="winner">{player.name}</span>
      </h2>
    </div>
  )
};
const Game = () => {
  const [formation, setFormation] = useState(generateFormation(FORMATION));
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [playerIndex, setPlayerIndex] = useState(0);

  const currentPlayer = PLAYERS[playerIndex];
  const winner = isFormationEmpty(formation) && currentPlayer;

  const changeToNextPlayer = useCallback(() => {
    if (playerIndex < PLAYERS.length - 1) {
      setPlayerIndex(playerIndex + 1);
    } else {
      setPlayerIndex(0);
    }
  }, [playerIndex, setPlayerIndex]);

  const play = (selectedItems) => {
    const newFormation = formation.map(group => {
      return group.filter(item => {
        return !selectedItems.some(selectedItem => {
          return isItemMatch(item, selectedItem)
        });
      });
    });
    if (!isFormationEmpty(newFormation)) {
      changeToNextPlayer();
    }
    setFormation(newFormation);
    setSelectedItems([]);
    setSelectedMode(null);
  };
  const deselectItems = (items) => {
    const newSelectedItems = selectedItems.filter(selectedItem => {
      return !items.some(item => {
        return isItemMatch(item, selectedItem);
      });
    });

    if (!newSelectedItems.length) {
      setSelectedMode(false);
    }

    setSelectedItems(newSelectedItems);
  };
  const selectItems = (items) => {
    if (!selectedMode) {
      setSelectedMode({ groupIndex: items[0].groupIndex });
    }

    const currentSelectedGroup = selectedMode ? selectedMode.groupIndex : items[0].groupIndex;
    const itemsRelated = items.every(item => item.groupIndex === currentSelectedGroup);

    if (itemsRelated) {
      const newSelectedItems = selectedItems.slice(0);
      newSelectedItems.push(...items);
      setSelectedItems(newSelectedItems);
    }
  };

  useEffect(() => {
    if (!winner && isPlayerComputer(currentPlayer)) {
      const nimSum = calculateNimSum(formation);
      let newSelectedItems;

      if (nimSum !== 0) {
        const winningGroupIndex = getWinningGroupIndex(formation);
        const winningGroup = formation[winningGroupIndex];
        const groupNimSum = winningGroup.length ^ nimSum;
        const removeCount = winningGroup.length - groupNimSum;
        newSelectedItems = winningGroup.slice(0, removeCount);
      } else {
        const winningGroup = formation.reduce((minGroup, currentGroup) => {
          if (currentGroup.length < minGroup.length) return currentGroup;
          return minGroup;
        });
        newSelectedItems = winningGroup[0];
      }

      selectItems(newSelectedItems);
      const timer = setTimeout(() => {
        play(newSelectedItems)
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, formation, changeToNextPlayer]);

  return !winner ? (
    <>
      <Information player={currentPlayer} />
      <Formation
        formation={formation}
        selectedItems={selectedItems}
        selectItem={(item) => {
          const isItemSelected = selectedItems.some(selectedItem => {
            return isItemMatch(selectedItem, item);
          });

          if (!isItemSelected) {
            selectItems([item]);
          } else {
            deselectItems([item]);
          }
        }}
      />
      <span className="d-block text-center mb-3">
        <span className="font-weight-bold">Selected:</span> {selectedItems.length}
      </span>
      <button
        className={classnames('btn btn-primary', {
          disabled: isPlayerComputer(currentPlayer)
        })}
        onClick={() => play(selectedItems)}
      >
        {isPlayerComputer(currentPlayer) ?
          'Waiting for the computer to play...' : 'Play'}
      </button>
    </>
  ) : <Winner player={winner} />
};

export default Game;