import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ResponseDto } from '../dto/response.dto';

function createResponseSchema(
  model: Type<any>,
  statusCode: number,
  message: string,
  example?: object,
) {
  return {
    allOf: [
      { $ref: getSchemaPath(ResponseDto) },
      {
        properties: {
          statusCode: { example: statusCode },
          message: { example: message },
          data: example ? { example } : { $ref: getSchemaPath(model) },
        },
      },
    ],
  };
}

export function ApiOkResponseDto<TModel extends Type<any>>(
  model: TModel,
  example?: object,
  message = '성공',
) {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiOkResponse({
      description: message,
      schema: createResponseSchema(model, 200, message, example),
    }),
  );
}

export function ApiCreatedResponseDto<TModel extends Type<any>>(
  model: TModel,
  example?: object,
  message = '생성되었습니다',
) {
  return applyDecorators(
    ApiExtraModels(ResponseDto, model),
    ApiCreatedResponse({
      description: message,
      schema: createResponseSchema(model, 201, message, example),
    }),
  );
}

export function ApiBadRequestResponseDto(message = '잘못된 요청') {
  return ApiBadRequestResponse({ description: message });
}

export function ApiUnauthorizedResponseDto(message = '인증 실패') {
  return ApiUnauthorizedResponse({ description: message });
}

export function ApiNotFoundResponseDto(message = '찾을 수 없음') {
  return ApiNotFoundResponse({ description: message });
}
