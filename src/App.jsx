import { useEffect, useRef, useState } from "react";
import "./App.css";
import pokemonData, { typeChart } from "./pokemonData";

const trainerSprites = {
  player: "https://depictukinetic.carrd.co/assets/images/gallery03/5db9a82b.png?v=253bcc8c",
  opponent: "https://pokemoncosmicquest.wordpress.com/wp-content/uploads/2023/02/galileo-final.png",
};

const typeColors = {
  Fire: "#F08030",
  Water: "#6890F0",
  Grass: "#78C850",
  Electric: "#F8D030",
  Psychic: "#F85888",
  Normal: "#A8A878",
  Fighting: "#C03028",
  Flying: "#A890F0",
  Poison: "#A040A0",
  Ground: "#E0C068",
  Rock: "#B8A038",
  Bug: "#A8B820",
  Ghost: "#705898",
  Ice: "#98D8D8",
  Dragon: "#7038F8",
  Dark: "#705848",
  Steel: "#B8B8D0",
  Fairy: "#EE99AC",
};

const typeEmojis = {
  Fire: "🔥",
  Water: "💧",
  Grass: "🌿",
  Electric: "⚡",
  Psychic: "🧠",
  Normal: "⭕",
  Fighting: "👊",
  Flying: "🦅",
  Poison: "☠️",
  Ground: "🌍",
  Rock: "🪨",
  Bug: "🐞",
  Ghost: "👻",
  Ice: "❄️",
  Dragon: "🐉",
  Dark: "🌑",
  Steel: "⚙️",
  Fairy: "✨",
};

function App() {
  // Game states
  const [gameState, setGameState] = useState("difficultySelect"); // difficultySelect, pokemonSelect, battle, gameOver
  const [difficulty, setDifficulty] = useState("Normal");

  // Player state
  const [playerPokemon, setPlayerPokemon] = useState(null);
  const [playerTeam, setPlayerTeam] = useState([]);
  const [playerItems, setPlayerItems] = useState({ heal: 3, fullRestore: 1 });
  const [playerStats, setPlayerStats] = useState({ wins: 0, losses: 0, streak: 0 });

  // Opponent state
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [opponentTeam, setOpponentTeam] = useState([]);

  // Battle state
  const [message, setMessage] = useState("");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLogs, setBattleLogs] = useState([]);
  const [activeStatusEffect, setActiveStatusEffect] = useState(null);
  const [damageAnimation, setDamageAnimation] = useState(null);
  const [animatingPokemon, setAnimatingPokemon] = useState(null);

  // Refs
  const attackSound = useRef(null);
  const missSound = useRef(null);
  const victorySound = useRef(null);
  const defeatSound = useRef(null);
  const battleLogContainer = useRef(null);

  // Auto-scroll battle log to bottom when logs update
  useEffect(() => {
    if (battleLogContainer.current) {
      setTimeout(() => {
        battleLogContainer.current.scrollTop = battleLogContainer.current.scrollHeight;
      }, 0);
    }
  }, [battleLogs]);

  // Initialize battle with selected difficulty
  const startBattle = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setGameState("pokemonSelect");
    setMessage("Choose your starting Pokémon!");
  };

  // Deep clone Pokemon with fresh moves
  const clonePokemon = (pokemon) => {
    return {
      ...pokemon,
      moves: pokemon.moves.map(move => ({ ...move, ppUsed: 0 })),
      currentExp: 0,
      status: null,
      confusionTurns: 0,
    };
  };

  // Choose player Pokemon
  const choosePokemon = (pokemon) => {
    const cloned = clonePokemon(pokemon);
    setPlayerPokemon(cloned);
    
    // Get random opponent
    const randomOpp = pokemonData[Math.floor(Math.random() * pokemonData.length)];
    const oppCloned = clonePokemon(randomOpp);
    setOpponentPokemon(oppCloned);
    
    setGameState("battle");
    setIsPlayerTurn(true);
    setBattleLogs([]);
    setActiveStatusEffect(null);
    addLog(`You sent out ${cloned.name}! Opponent sent out ${oppCloned.name}!`);
    setMessage(`Go, ${cloned.name}!`);
  };

  // Calculate type effectiveness
  const calculateEffectiveness = (moveType, defendingType) => {
    const typeData = typeChart[moveType];
    if (typeData.super.includes(defendingType)) return 1.5;
    if (typeData.weak.includes(defendingType)) return 0.5;
    return 1.0;
  };

  // Calculate damage
  const calculateDamage = (attacker, move, defender, isCrit = false) => {
    let damage = move.damage;
    
    if (!damage) return 0; // Status move

    // Base damage with attacker's stats
    if (move.category === "physical") {
      damage = (move.damage * attacker.attack) / 100;
    } else if (move.category === "special") {
      damage = (move.damage * attacker.spAtk) / 100;
    }

    // Defender's defenses reduce damage
    if (move.category === "physical") {
      damage = damage * (100 / (100 + defender.defense));
    } else if (move.category === "special") {
      damage = damage * (100 / (100 + defender.spDef));
    }

    // Type effectiveness
    const effectiveness = calculateEffectiveness(move.type, defender.type);
    damage *= effectiveness;

    // Critical hit
    if (isCrit) {
      damage *= 1.5;
    }

    // Randomness
    damage *= (0.85 + Math.random() * 0.15);

    return Math.max(1, Math.round(damage));
  };

  // Add battle log
  const addLog = (text) => {
    setBattleLogs((prev) => [...prev, text]);
  };

  // Apply status effect
  const applyStatusEffect = (pokemon, effect) => {
    setPlayerPokemon((prev) => 
      prev?.name === pokemon.name ? { ...prev, status: effect } : prev
    );
    setOpponentPokemon((prev) =>
      prev?.name === pokemon.name ? { ...prev, status: effect } : prev
    );
  };

  // Play sound effect
  const playSound = (soundRef) => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch(() => {}); // Ignore errors
    }
  };

  // Player attack
  const playerAttack = (move) => {
    if (!playerPokemon || !opponentPokemon) return;

    // Check move availability
    const ppRemaining = move.pp - move.ppUsed;
    if (ppRemaining <= 0) {
      setMessage(`No PP left for ${move.name}!`);
      return;
    }

    // Update PP
    setPlayerPokemon((prev) => ({
      ...prev,
      moves: prev.moves.map((m) =>
        m.name === move.name ? { ...m, ppUsed: m.ppUsed + 1 } : m
      ),
    }));

    // Check accuracy
    if (Math.random() > move.accuracy) {
      setAnimatingPokemon("player");
      playSound(missSound);
      addLog(`${playerPokemon.name} tried to use ${move.name} but missed!`);
      setMessage(`${move.name} missed!`);
      
      setTimeout(() => {
        setAnimatingPokemon(null);
        setIsPlayerTurn(false);
        setTimeout(() => opponentAttackFunc(), 1000);
      }, 600);
      return;
    }

    // Deal damage and animate
    playSound(attackSound);
    setAnimatingPokemon("player");

    setTimeout(() => {
      const isCrit = Math.random() < 0.1;
      const damage = calculateDamage(playerPokemon, move, opponentPokemon, isCrit);
      const effectiveness = calculateEffectiveness(move.type, opponentPokemon.type);

      const newOppHp = Math.max(0, opponentPokemon.hp - damage);
      setOpponentPokemon((prev) => ({ ...prev, hp: newOppHp }));

      // Damage animation
      setDamageAnimation({ damage, effectiveness });
      setTimeout(setAnimatingPokemon(null), 700);

      let logText = `${playerPokemon.name} used ${move.name} for ${damage} damage!`;
      if (isCrit) logText += " Critical hit!";
      if (effectiveness > 1.0) logText += " Super effective!";
      else if (effectiveness < 1.0) logText += " Not very effective...";

      addLog(logText);
      setMessage(logText);

      // Apply status effect
      if (move.effect) {
        applyStatusEffect(opponentPokemon, move.effect);
        addLog(`${opponentPokemon.name} is now ${move.effect}!`);
      }

      // Check if opponent fainted
      if (newOppHp <= 0) {
        setMessage(`${playerPokemon.name} wins!`);
        addLog(`${opponentPokemon.name} fainted!`);
        setPlayerStats((prev) => ({ ...prev, wins: prev.wins + 1, streak: prev.streak + 1 }));
        localStorage.setItem(
          "pokemonStats",
          JSON.stringify({ ...playerStats, wins: playerStats.wins + 1, streak: playerStats.streak + 1 })
        );
        setTimeout(() => setGameState("gameOver"), 2000);
        return;
      }

      setIsPlayerTurn(false);
      setTimeout(() => opponentAttackFunc(), 1500);
    }, 300);
  };

  // Opponent attack
  const opponentAttackFunc = () => {
    if (!playerPokemon || !opponentPokemon) return;

    // Get available moves
    const availableMoves = opponentPokemon.moves.filter(
      (m) => m.ppUsed < m.pp
    );

    if (availableMoves.length === 0) {
      addLog(`${opponentPokemon.name} has no moves left!`);
      setMessage(`${opponentPokemon.name} has no moves!`);
      setTimeout(() => setIsPlayerTurn(true), 1000);
      return;
    }

    let selectedMove;
    if (difficulty === "Hard") {
      // AI selects highest damage move
      selectedMove = availableMoves.reduce((best, move) =>
        move.damage > best.damage ? move : best
      );
    } else if (difficulty === "Easy") {
      // AI selects random, but worse choices
      selectedMove =
        availableMoves[Math.floor(Math.random() * Math.min(availableMoves.length, 2))];
    } else {
      // Normal: random choice
      selectedMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    // Check accuracy
    if (Math.random() > selectedMove.accuracy) {
      playSound(missSound);
      setAnimatingPokemon("opponent");
      addLog(`${opponentPokemon.name} tried to use ${selectedMove.name} but missed!`);
      setMessage(`Opponent's ${selectedMove.name} missed!`);

      setTimeout(() => {
        setAnimatingPokemon(null);
        setIsPlayerTurn(true);
      }, 1000);
      return;
    }

    // Deal damage
    playSound(attackSound);
    setAnimatingPokemon("opponent");

    setTimeout(() => {
      const isCrit = Math.random() < 0.1;
      const damage = calculateDamage(opponentPokemon, selectedMove, playerPokemon, isCrit);
      const effectiveness = calculateEffectiveness(selectedMove.type, playerPokemon.type);

      const newPlayerHp = Math.max(0, playerPokemon.hp - damage);
      setPlayerPokemon((prev) => ({ ...prev, hp: newPlayerHp }));

      setDamageAnimation({ damage, effectiveness });
      setTimeout(setAnimatingPokemon(null), 700);

      let logText = `${opponentPokemon.name} used ${selectedMove.name} for ${damage} damage!`;
      if (isCrit) logText += " Critical hit!";
      if (effectiveness > 1.0) logText += " Super effective!";
      else if (effectiveness < 1.0) logText += " Not very effective...";

      addLog(logText);
      setMessage(logText);

      // Apply status effect
      if (selectedMove.effect) {
        applyStatusEffect(playerPokemon, selectedMove.effect);
        addLog(`${playerPokemon.name} is now ${selectedMove.effect}!`);
      }

      setOpponentPokemon((prev) => ({
        ...prev,
        moves: prev.moves.map((m) =>
          m.name === selectedMove.name ? { ...m, ppUsed: m.ppUsed + 1 } : m
        ),
      }));

      // Check if player's Pokemon fainted
      if (newPlayerHp <= 0) {
        setMessage(`${playerPokemon.name} fainted!`);
        addLog(`${opponentPokemon.name} wins!`);
        setPlayerStats((prev) => ({ ...prev, losses: prev.losses + 1, streak: 0 }));
        localStorage.setItem(
          "pokemonStats",
          JSON.stringify({ ...playerStats, losses: playerStats.losses + 1, streak: 0 })
        );
        setTimeout(() => setGameState("gameOver"), 2000);
      } else {
        setTimeout(() => setIsPlayerTurn(true), 500);
      }
    }, 300);
  };

  // Use healing item
  const useItem = (itemType) => {
    if (playerPokemon?.hp === playerPokemon?.maxHp) {
      setMessage("Your Pokémon is already at full health!");
      return;
    }

    if (itemType === "heal" && playerItems.heal <= 0) {
      setMessage("No healing items available!");
      return;
    }
    if (itemType === "fullRestore" && playerItems.fullRestore <= 0) {
      setMessage("No Full Restores available!");
      return;
    }

    let healAmount = itemType === "heal" ? 50 : 999;
    setPlayerPokemon((prev) => ({
      ...prev,
      hp: Math.min(prev.maxHp, prev.hp + healAmount),
    }));

    setPlayerItems((prev) => ({
      ...prev,
      [itemType]: prev[itemType] - 1,
    }));

    addLog(`${playerPokemon.name} used ${itemType === "heal" ? "a Potion" : "a Full Restore"}!`);
    setMessage(`${playerPokemon.name} healed!`);
    
    // Opponent attacks after item use
    setTimeout(() => {
      setIsPlayerTurn(false);
      setTimeout(() => opponentAttackFunc(), 1000);
    }, 500);
  };

  // Reset game
  const resetGame = () => {
    setGameState("difficultySelect");
    setPlayerPokemon(null);
    setOpponentPokemon(null);
    setMessage("");
    setBattleLogs([]);
    setActiveStatusEffect(null);
    setDamageAnimation(null);
  };

  // Render life bar
  const renderLifeBar = (hp, maxHp) => {
    const percentage = (hp / maxHp) * 100;
    return (
      <div className="life-bar-container">
        <div className="life-bar-bg">
          <div
            className="life-bar"
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage > 50 ? "#00AA00" : percentage > 25 ? "#FFAA00" : "#AA0000",
            }}
          />
        </div>
      </div>
    );
  };

  // Render difficulty select screen
  if (gameState === "difficultySelect") {
    return (
      <div className="nes-container is-rounded is-dark App difficulty-select">
        <img src="/pokeball.svg" alt="Pokéball" className="pokeball-icon" />
        <h1>Pokémon Battle Arena</h1>
        <p>Select Difficulty</p>
        <div className="difficulty-buttons">
          <button className="nes-btn is-success" onClick={() => startBattle("Easy")}>
            Easy
          </button>
          <button className="nes-btn is-warning" onClick={() => startBattle("Normal")}>
            Normal
          </button>
          <button className="nes-btn is-error" onClick={() => startBattle("Hard")}>
            Hard
          </button>
        </div>
      </div>
    );
  }

  // Render Pokemon select screen
  if (gameState === "pokemonSelect") {
    return (
      <div className="nes-container is-rounded is-dark App pokemon-select-screen">
        <img src="/pokeball.svg" alt="Pokéball" className="pokeball-icon" />
        <h1>Pokémon Battle Arena</h1>
        <p>Difficulty: <strong>{difficulty}</strong></p>
        <h2>Choose Your Starting Pokémon</h2>
        <div className="pokemon-selection-grid">
          {pokemonData.map((pokemon) => (
            <button
              key={pokemon.id}
              className="pokemon-card nes-btn"
              onClick={() => choosePokemon(pokemon)}
            >
              <img src={pokemon.sprite} alt={pokemon.name} />
              <div className="pokemon-card-info">
                <h4>{pokemon.name}</h4>
                <p style={{ color: typeColors[pokemon.type] }}>
                  {typeEmojis[pokemon.type]} {pokemon.type}
                </p>
                <p className="hp-info">HP: {pokemon.hp}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Render battle screen
  if (gameState === "battle" && playerPokemon && opponentPokemon) {
    return (
      <div className="nes-container is-rounded is-dark App battle-screen">
        <div className="battle-screen-content">
          <div className="battle-header">
            <img src="/pokeball.svg" alt="Pokéball" className="pokeball-icon" />
            <h1>Pokémon Battle Arena</h1>
            <div className="stats-display">
              <p>W: {playerStats.wins} | L: {playerStats.losses} | Streak: {playerStats.streak}</p>
            </div>
          </div>

        <p className="battle-message">{message}</p>

        <div className="battle-arena">
          {/* Opponent Pokemon */}
          <div className="pokemon-battle-container opponent">
            <div className="trainer-section">
              <img src={trainerSprites.opponent} alt="Opponent Trainer" className="trainer-sprite" />
            </div>
            <div className={`pokemon-section ${animatingPokemon === "opponent" ? "attacking" : ""}`}>
              <h3>{opponentPokemon.name}</h3>
              <div className="type-badge" style={{ backgroundColor: typeColors[opponentPokemon.type] }}>
                {typeEmojis[opponentPokemon.type]} {opponentPokemon.type}
              </div>
              <img
                src={opponentPokemon.sprite}
                alt={opponentPokemon.name}
                className="pokemon-sprite"
              />
              {renderLifeBar(opponentPokemon.hp, opponentPokemon.maxHp)}
              <p className="hp-display">
                HP: {opponentPokemon.hp}/{opponentPokemon.maxHp}
              </p>
              {opponentPokemon.status && (
                <div className="status-effect">{opponentPokemon.status.toUpperCase()}</div>
              )}
            </div>
          </div>

          {/* Player Pokemon */}
          <div className="pokemon-battle-container player">
            <div className={`pokemon-section ${animatingPokemon === "player" ? "attacking" : ""}`}>
              <h3>{playerPokemon.name}</h3>
              <div className="type-badge" style={{ backgroundColor: typeColors[playerPokemon.type] }}>
                {typeEmojis[playerPokemon.type]} {playerPokemon.type}
              </div>
              <img
                src={playerPokemon.sprite}
                alt={playerPokemon.name}
                className="pokemon-sprite"
              />
              {renderLifeBar(playerPokemon.hp, playerPokemon.maxHp)}
              <p className="hp-display">
                HP: {playerPokemon.hp}/{playerPokemon.maxHp}
              </p>
              {playerPokemon.status && (
                <div className="status-effect">{playerPokemon.status.toUpperCase()}</div>
              )}
            </div>
            <div className="trainer-section">
              <img src={trainerSprites.player} alt="Player Trainer" className="trainer-sprite" />
            </div>
          </div>
        </div>

        {/* Damage animation */}
        {damageAnimation && (
          <div className="damage-number">-{damageAnimation.damage}</div>
        )}

        {/* Controls */}
        {isPlayerTurn && playerPokemon.hp > 0 && opponentPokemon.hp > 0 && (
          <div className="battle-controls">
            <div className="moves-section">
              <h3>Moves</h3>
              <div className="moves-grid">
                {playerPokemon.moves.map((move) => {
                  const ppRemaining = move.pp - move.ppUsed;
                  return (
                    <button
                      key={move.name}
                      className="nes-btn move-btn"
                      onClick={() => playerAttack(move)}
                      disabled={ppRemaining <= 0}
                      style={{
                        borderColor: typeColors[move.type],
                        opacity: ppRemaining <= 0 ? 0.5 : 1,
                      }}
                    >
                      <div className="move-info">
                        <p className="move-name">{move.name}</p>
                        <p className="move-stats">
                          {typeEmojis[move.type]} {move.damage || "—"} DMG
                        </p>
                        <p className="move-pp">PP: {ppRemaining}/{move.pp}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="items-section">
              <h3>Items</h3>
              <div className="items-grid">
                <button
                  className="nes-btn item-btn"
                  onClick={() => useItem("heal")}
                  disabled={playerItems.heal <= 0 || playerPokemon.hp === playerPokemon.maxHp}
                >
                  <p>Potion</p>
                  <p className="item-count">x{playerItems.heal}</p>
                </button>
                <button
                  className="nes-btn item-btn"
                  onClick={() => useItem("fullRestore")}
                  disabled={playerItems.fullRestore <= 0 || playerPokemon.hp === playerPokemon.maxHp}
                >
                  <p>Full Restore</p>
                  <p className="item-count">x{playerItems.fullRestore}</p>
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* Battle log */}
        <div className="nes-container with-title is-dark battle-log-container">
          <p className="title">Battle Log</p>
          <div className="battle-log" ref={battleLogContainer}>
            {battleLogs.map((log, idx) => (
              <p key={idx} className="log-entry">
                {log}
              </p>
            ))}
          </div>
        </div>

        {/* Audio elements */}
        <audio ref={attackSound} src="https://vgmtreasurechest.com/soundtracks/pokemon-sfx-gen-3-attack-moves-rse-fr-lg/izqqhmeayp/Tackle.mp3" preload="auto" />
        <audio ref={missSound} src="https://vgmtreasurechest.com/soundtracks/pokemon-mystery-dungeon-red-rescue-team-sfx/dqkk65lo5e/Move%20-%20Miss.mp3" preload="auto" />
        <audio ref={victorySound} src="https://vgmtreasurechest.com/soundtracks/pokemon-emerald-sfx/mxmqytz4vf/VSSeeker%20-%20Victory.mp3" preload="auto" />
        <audio ref={defeatSound} src="https://vgmtreasurechest.com/soundtracks/pokemon-red-sfx/g3sjjyxcyf/Lose.mp3" preload="auto" />
      </div>
    );
  }

  // Render game over screen
  if (gameState === "gameOver") {
    const isPlayerVictory = opponentPokemon?.hp <= 0;
    return (
      <div className="nes-container is-rounded is-dark App game-over-screen">
        <img src="/pokeball.svg" alt="Pokéball" className="pokeball-icon" />
        <h1>{isPlayerVictory ? "VICTORY!" : "DEFEAT!"}</h1>
        <div className="game-over-stats">
          <p>Total Wins: {playerStats.wins}</p>
          <p>Total Losses: {playerStats.losses}</p>
          <p>Current Streak: {playerStats.streak}</p>
        </div>
        <button className="nes-btn is-primary" onClick={resetGame}>
          Play Again
        </button>
      </div>
    );
  }
}

export default App;
