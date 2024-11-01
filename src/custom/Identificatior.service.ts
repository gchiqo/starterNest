import axios from 'axios';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Inject } from '@nestjs/common';

export class IdentificatiorService {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
    ) { }

    public getRequestIP(): string {
        const ip =
            this.request.headers['x-forwarded-for'] ||
            this.request.ip ||
            this.request.connection.remoteAddress;
        return Array.isArray(ip) ? ip[0] : ip;
    }

    public getAllIPs(): string[] {
        const ips = [];
        if (this.request.headers['x-forwarded-for']) {
            ips.push(this.request.headers['x-forwarded-for']);
        }
        if (this.request.ip) {
            ips.push(this.request.ip);
        }
        if (this.request.connection.remoteAddress) {
            ips.push(this.request.connection.remoteAddress);
        }
        return ips.flatMap(ip => (Array.isArray(ip) ? ip : [ip]));
    }

    public async getRequestDetails(ip: string): Promise<any> {
        try {
            const response = await axios.get(`http://ip-api.com/json/${ip}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user details:', error);
            return {};
        }

    }

    async getRequestInfoJson(): Promise<any> {
        const userIp = this.getRequestIP();
        const allIps = this.getAllIPs();
        const userDetails = await this.getRequestDetails(userIp);

        const requestData = {
            headers: this.request.headers,
            cookies: this.request.cookies,
            params: this.request.params,
            query_params: this.request.query,
            post_params: this.request.body,
            raw_trailers: this.request.rawTrailers,
            user_ip: userIp,
            all_ips: allIps,
            user_details: userDetails,
            user_agent: this.request.get('User-Agent'),
            request_time: Date.now(),
            remote_port: this.request.connection.remotePort,
            server_name: this.request.hostname,
            request_method: this.request.method,
            server_protocol: `HTTP/${this.request.httpVersion}`,
        };

        // If the raw POST body is JSON, decode it and add to the request data
        if (this.request.is('application/json') && typeof this.request.body === 'object') {
            requestData['json_post_body'] = this.request.body;
        }

        const requestJson = JSON.stringify(requestData);
        console.log(requestData);
        return requestJson;
    }

    async test1() {
        console.log(this.request)
        return this.request
    }
}