const schema: Record<string, unknown> = {
  $schema: 'http://json-schema.org/draft-07/schema',
  $id: 'http://example.com/example.json',
  type: 'object',
  default: {},
  required: ['apiVersion', 'kind', 'metadata', 'spec'],
  properties: {
    apiVersion: {
      $id: '#/properties/apiVersion',
      type: 'string',
      default: '',
      const: 'cert-manager.io/v1',
    },
    kind: {
      $id: '#/properties/kind',
      type: 'string',
      default: '',
      const: 'Issuer',
    },
    metadata: {
      $id: '#/properties/metadata',
      type: 'object',
      default: {},
      required: ['name'],
      properties: {
        name: {
          $id: '#/properties/metadata/properties/name',
          type: 'string',
          default: '',
        },
      },
      additionalProperties: true,
    },
    spec: {
      $id: '#/properties/spec',
      type: 'object',
      default: {},
      additionalProperties: true,
    },
  },
  additionalProperties: true,
};

export default schema;
