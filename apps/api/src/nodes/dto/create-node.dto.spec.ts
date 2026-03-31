import { ValidationPipe } from '@nestjs/common';
import { CreateNodeDto } from './create-node.dto';

describe('CreateNodeDto', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });

  it('strips non-whitelisted fields from node imports', async () => {
    const transformed = await pipe.transform(
      {
        hostname: 'node1.example.com',
        port: '443',
        protocol: 'vmess',
        region: 'Global',
        tags: ['premium', 'hk'],
        injected: 'drop-me',
      },
      {
        type: 'body',
        metatype: CreateNodeDto,
        data: '',
      },
    );

    expect(transformed).toEqual({
      hostname: 'node1.example.com',
      port: 443,
      protocol: 'vmess',
      region: 'Global',
      tags: ['premium', 'hk'],
    });
  });

  it('rejects unsupported protocols', async () => {
    await expect(
      pipe.transform(
        {
          hostname: 'node1.example.com',
          port: '443',
          protocol: 'constructor',
          region: 'Global',
        },
        {
          type: 'body',
          metatype: CreateNodeDto,
          data: '',
        },
      ),
    ).rejects.toThrow();
  });
});
