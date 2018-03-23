import React, { Component } from 'react';
import styled from 'styled-components';
import { curry, concat, reduce, compose, map, split, addIndex } from 'ramda';
import { getMinutes, getHours } from 'date-fns';
import { toWords } from 'number-to-words';
import toNumbers from 'words-to-numbers';

const LINE_LIMIT = 16;
const CONSTANTS = ['half', 'quarter', 'minutes', 'past', 'oclock', 'to'];
const WORDS =
  '1 2 3 4 sat 5 6 7 be 8 9 10 s 1 11 12 half quarter minutes to 20 13 at 14 15 s past to 16 ckn 17 20 a 18 19 30 40 50 oclock 1 2 moon 3 4 5 6 7 8 9 io 10 11 12 s';

const Line = styled.div`
  display: flex;
`;
const Word = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  ${Character} {
    color: ${props => props.active && 'red'};
  }
`;

const Character = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
`;

const splitWordIntoChars = compose(map(c => [c]), split(''));

function format(s) {
  try {
    return [splitWordIntoChars(toWords(parseInt(s, 10)))];
  } catch (e) {
    return CONSTANTS.includes(s)
      ? [splitWordIntoChars(s)]
      : splitWordIntoChars(s);
  }
}

let chars = 0;
let words = 0;

function wrapChar(c) {
  return <Character key={++chars}>{c}</Character>;
}

function wrapWord(w, t) {
  const n = toNumbers(w.join(''));

  const tenth = Math.floor(t.m / 10) * 10;

  return (
    <Word key={++words} active={n === t.h || n === tenth || n === t.m - tenth}>
      {w.map(wrapChar)}
    </Word>
  );
}

const createLines = curry(function createLines(time, lines, c) {
  const index = Math.floor(chars / LINE_LIMIT);

  lines[index] = lines[index] || [];

  lines[index].push(c instanceof String ? wrapChar(c) : wrapWord(c, time));

  return lines;
});

function wrapLines(l, i) {
  return <Line key={i}>{l}</Line>;
}

const parse = time =>
  compose(
    addIndex(map)(wrapLines),
    reduce(createLines(time), []),
    reduce(concat, []),
    map(format),
    split(' ')
  );

class App extends Component {
  state = {
    time: Date.now()
  };

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ time: Date.now() });
    }, 60 * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    const { time } = this.state;

    return parse({ m: getMinutes(time), h: getHours(time) })(WORDS);
  }
}

export default App;
