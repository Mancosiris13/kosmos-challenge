import React, { useRef, useState, useEffect } from 'react';
import Moveable from 'react-moveable';
import './styles.css';

/**
 * 
 *  1.-This function fetch the images API, storing the data retrieved into a json,
    2.-Gets the total numbers of objects inside the API.
    3.-Makes a random selection of one of the object inse the API
    4.-Finally returns the URL of the random selected object

*/
async function fetchImage() {
  const response = await fetch('https://jsonplaceholder.typicode.com/photos');
  const data = await response.json();
  const totalObjects = data.length;
  const randomSelection = Math.floor(Math.random() * totalObjects);
  return data[randomSelection].url;
}

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  /**
   * Create a new moveable component and add it to the array
   * Gets the color slicing the url and substraction the color id
   * Gives a random fit
   */
  const addMoveable = async () => {
    const differentFits = ['auto', 'contain', 'cover'];

    const url = await fetchImage();
    console.log('url fetched: ' + url);
    const lastIndexOfSlash = url.lastIndexOf('/');
    const color = url.slice(lastIndexOfSlash + 1);
    console.log('color code: ' + color);
    const fit = differentFits[Math.floor(Math.random() * differentFits.length)];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: '#' + color,

        fit,
        updateEnd: true,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log('e', e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log('width', moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  /**
   *  1.- onRemove function deletes the selected component, by getting the id from the button 'Remove' when calling the function on the onClick event ,
   *  filtering the moveableComponents by excluding the id matched.
   *
   */
  const onRemove = (id) => {
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== id
    );
    setMoveableComponents(updatedMoveables);
  };

  return (
    <main style={{}} className="main">
      <header>
        <h1>Frontend Challenge</h1>
        <h4>Candidate: Osiris Ramsés Macías Gómez</h4>
        <button className="add-button" onClick={addMoveable}>
          Add Moveable{' '}
        </button>
      </header>

      <section className="grid">
        <div id="parent" className="parent-div">
          {moveableComponents.map((item, index) => (
            <Component
              {...item}
              key={index}
              onRemove={onRemove}
              updateMoveable={updateMoveable}
              handleResizeStart={handleResizeStart}
              setSelected={setSelected}
              isSelected={selected === item.id}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default App;

/**
 *  Creating the Rendered component when clicking the Add Moveable button
 *
 */
const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  fit,
  onRemove,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById('parent');
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    // Update height and width
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      fit,
    });

    // Update reference Node
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  /**
   * Updates de top and left position to the finall positions when Resize is finished
   *
   */
  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(
      id,
      {
        top: ref.current.offsetTop,
        left: ref.current.offsetLeft,
        width: newWidth,
        height: newHeight,
        color,
        fit,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={'component-' + id}
        style={{
          position: 'absolute',
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          backgroundSize: fit,
          backgroundPosition: 'center',
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable
        key={id}
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            fit,
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        bounds={{
          left: parent.clientLeft,
          top: parent.clientTop,
          right: parent.offsetWidth,
          bottom: parent.offsetHeight,
        }}
        snappable={true}
        ables={[Removeable]}
        removeable={true}
        props={{
          onRemove,
          id,
        }}
        on
      />
    </>
  );
};

/**
 * Creates a son button of the created element with the Moveable method, only can exist insided the parent component, that is why this button is rendered inside
 * the parent component each time we select a different Image
 * Calls the onRemove method and pass the prop id to the function so the function can make its filter correctly.
 */
const Removeable = {
  name: 'removeable',
  render(buttonRemover) {
    const { onRemove, id } = buttonRemover.props;
    return (
      <div>
        <button className="remove-btn" onClick={() => onRemove(id)}>
          Remove
        </button>
      </div>
    );
  },
};
