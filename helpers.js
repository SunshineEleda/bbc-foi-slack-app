const block = dataset =>
  dataset.map(data => {
    return {
      text: {
        type: 'plain_text',
        text: data.name,
        emoji: true,
      },
      value: 'value-0',
    };
  });

module.exports = { block };
